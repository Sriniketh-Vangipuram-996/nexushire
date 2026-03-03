import jwt from "jsonwebtoken";

export const signAccessToken=(userId:string,role:string,tenantId:string)=>
    jwt.sign({userId,role,tenantId},process.env.JWT_SECRET!,{expiresIn:"15m"});

export const signRefreshToken=(userId:string,role:string,tenantId:string)=>
    jwt.sign({userId,role,tenantId},process.env.JWT_REFRESH_SECRET!,{
        expiresIn:"7d",
    });