import { Request,Response } from "express";
import * as bcrypt from "bcryptjs";
import User from "../../../common/models/User";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../../../common/middleware/auth";
import { signAccessToken,signRefreshToken } from "../../../common/utils/jwt";
import { signEmailToken } from "../../../common/utils/emailToken";
import { sendVerificationEmail } from "../../../common/utils/sendEmail";
import { signResetToken } from "../../../common/utils/resetToken";
import { sendResetPasswordEmail } from "../../../common/utils/sendResetEmail";
import { Tenant } from "../../../common/models/Tenant";
import { createAuditLog } from "../services/auditService";


const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const specialRegex = /[!@#$%^&*(),.?":{}|<>]/; 
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}|:<>?]).{8,}$/;
// only real special characters
export const signup=async(req:Request,res:Response)=>{
    console.log("SIGNUP CONTROLLER HIT");

    try{
        const email=req.body.email?.trim().toLowerCase();
        const password=req.body.password?.trim();
        // Validation
        if (!email || !password || !emailRegex.test(email) || !passwordRegex.test(password)) {
  return res.status(400).json({
    error: "Password must be 8+ chars with uppercase, lowercase, number & special char"
  });
}
        const existingUser=await User.findOne({email:email.toLowerCase()});
        if(existingUser){
            return res.status(409).json({error:"Account already exists"});
        }

        const passwordHash=await bcrypt.hash(password,10);
        const tenant=await Tenant.create({
            name:`${email}'s Workspace`,
        })
        if(!tenant?._id){
            return res.status(500).json({error:"Tenant creation failed. Please try again."});
        }
        const user=await User.create({
            email,
            passwordHash,
            emailVerified:process.env.NODE_ENV==="test",
            tenantId:tenant._id,
        });

        const token=signEmailToken(user._id.toString());
        try{
            await sendVerificationEmail(user.email,token);
        }
        catch(err){
            req.log?.info("Email sending failed:");
            req.log?.error(err);
        }

        return res.status(201).json({
            message:"Account created. Please verify your email before logging in."
        });
    }
    catch(err){
        return res.status(500).json({error:"Something went wrong. Please try again."});
    }
};

export const login=async(req:Request,res:Response)=>{
    try{
        const {email,password}=req.body;

        if(!email || !password){
            return res.status(400).json({error:"Missing Credentials."});
        }

        const user=await User.findOne({email:email.toLowerCase()});
        if(!user){
            return res.status(404).json({error:"Account not found."});
        }

        const isMatch=await bcrypt.compare(password,user.passwordHash);
        if(!isMatch){
            return res.status(401).json({error:"Invalid Credentials."});
        }

        if(!user.emailVerified){
            return res.status(403).json({
                error:"Please verify your email before logging in."
            })
        }
         await createAuditLog({
            actorId: user._id.toString(),
            action: "USER_LOGIN",
            targetType: "User",
            targetId: user._id.toString(),
            ip: req.ip,
            requestId: req.requestId,
        });

        const accessToken=signAccessToken(user._id.toString(),user.role,user.tenantId.toString());
        const refreshToken=signRefreshToken(user._id.toString(),user.role,user.tenantId.toString());

        res
        .cookie("access_token",accessToken,{
            httpOnly:true,
            sameSite:"lax",
            secure:false,
            path:"/",
        })

        .cookie("refresh_token",refreshToken,{
            httpOnly:true,
            sameSite:"lax",
            secure:false,//true for only https,
            path:"/",
        })

        .json({message:"Login Successful"});
    }

    catch(error){
        req.log?.info("LOGIN ERROR:");
        req.log?.error(error);
        return res.status(500).json({error:"Something went wrong. Please try again."});
    }
}

export const me=async(req:AuthRequest,res:Response)=>{
    const user=await User.findById(req.user.userId).select("_id email role resume");

    if(!user){
        return res.status(401).json({error:"User not found."});
    }

    res.json({user});
};

export const logout=(_req:Request,res:Response)=>{
    res
    .clearCookie("access_token")
    .clearCookie("refresh_token")
    .json({message:"Logged Out successfully."});
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) return res.status(401).json({ error: "No refresh token." });

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };
    
    const user = await User.findById(payload.userId).select("-password");
    if (!user) return res.status(401).json({ error: "User not found." });

    const newAccessToken = signAccessToken(user._id.toString(),user.role,user.tenantId.toString());

    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });

    return res.json({user});
 // <--- important: send user object
  } catch {
    return res.status(401).json({ error: "Invalid refresh Token." });
  }
};


export const verifyEmail=async(req:Request,res:Response)=>{
    const{token}=req.query;
    if(!token){
        return res.status(400).send("Invalid verification link");
    }

    try{
        const payload=jwt.verify(
            token as string,
            process.env.JWT_EMAIL_SECRET!
        )as {userId:string};

        const user=await User.findByIdAndUpdate(payload.userId);

        if(!user){
            return res.status(400).send("User not found.");
        }

        user.emailVerified=true;
        await user.save();
        // 🔥 ISSUE TOKENS HERE (AUTO LOGIN)
        const accessToken = signAccessToken(user._id.toString(),user.role,user.tenantId.toString());
        const refreshToken = signRefreshToken(user._id.toString(),user.role,user.tenantId.toString());

        res
        .cookie("access_token", accessToken, {
            httpOnly: true,
            sameSite: "lax",
        })
        .cookie("refresh_token", refreshToken, {
            httpOnly: true,
            sameSite: "lax",
        })
        .redirect(`${process.env.FRONTEND_URL}/dashboard`);
    }
    catch{
        res.status(400).send("Verification link expired or invalid.");
    }
}

export const requestPasswordReset=async(req:Request,res:Response)=>{
    const {email}=req.body;
    const user=await User.findOne({email});
    if(user){
        const token=signResetToken(user._id.toString());

        const link=`${process.env.FRONTEND_URL}/reset-password?token=${token}`;

        try{
            await sendResetPasswordEmail(email,link);
        }
        catch(err){
            req.log?.info("Reset email failed:");
            req.log?.error(err);
        }
    }

    res.json({
        message:"If an account with that email exists, a reset link has been sent."
    });
};

export const resetPassword=async(req:Request,res:Response)=>{
    const{token,newPassword}=req.body;

    if(!token || !newPassword){
        return res.status(400).json({error:"Missing Fields"});
    }

    try{
        const payload=jwt.verify(token,process.env.JWT_RESET_SECRET!)as{userId:string};
        const hash=await bcrypt.hash(newPassword,10);

        await User.findByIdAndUpdate(payload.userId,{
            passwordHash:hash,
        });

        res.json({message:"Password updated successfully."});
    }
    catch{
        res.status(400).json({error:"Invalid or expired token."});
    }
}