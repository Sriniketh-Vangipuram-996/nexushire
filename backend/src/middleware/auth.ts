import {Request,Response, NextFunction} from 'express';
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request{
    user?:any;
    tenantId?:string;
}

export const requireAuth=(req:AuthRequest,res:Response,next:NextFunction)=>{
    const token=req.cookies.access_token;

    if(!token){
        return res.status(401).json({error:"Not authenticated."});
    }

    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET!)as {
            userId:string;
            role:string;
            tenantId:string;
        };

        req.user=decoded;
        next();
    }
    catch(err){
        return res.status(401).json({error:"Invalid Token."});
    }
}
