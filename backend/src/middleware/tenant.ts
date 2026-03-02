import { Response,NextFunction } from "express";
import { AuthRequest } from "./auth";

export const enforceTenant=(req:AuthRequest,res:Response,next:NextFunction)=>{
    if(!req.user?.tenantId){
        return res.status(403).json({
            message:"Tenant context missing",
        });
    }

    req.tenantId=req.user.tenantId;
    next();

}