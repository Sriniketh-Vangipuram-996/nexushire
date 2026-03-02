import jwt from "jsonwebtoken";

export const signResetToken=(userId:string)=>
    jwt.sign({userId},process.env.JWT_RESET_SECRET!,{
        expiresIn:"15m",
    })