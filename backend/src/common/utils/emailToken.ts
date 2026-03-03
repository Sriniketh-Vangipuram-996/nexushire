import jwt from "jsonwebtoken";

export const signEmailToken=(userId:string)=>
    jwt.sign({userId},process.env.JWT_EMAIL_SECRET!,{
        expiresIn:"24h"
    });