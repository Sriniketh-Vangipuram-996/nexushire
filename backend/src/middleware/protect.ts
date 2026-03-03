import { Request,Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload{
    userId:string;
    role?:string;
    tenantId?:string;
}

export const protect=(
    req:Request,res:Response,next:NextFunction
):void=>{
    try{
        const token=req.cookies.access_token;

        if(!token){
            res.status(401).json({
                error:"Not authorized, no token",
            });
            return;
        }

        const decoded=jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as JwtPayload;

        req.user={
            userId:decoded.userId,
            role:decoded.role,
            tenantId:decoded.tenantId || "unknown",
        };

        next();
    }
    catch(err){
        res.status(401).json({
            error:"Invalid or expired token",
        });
    }
};