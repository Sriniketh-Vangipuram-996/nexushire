import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import User from "../models/User";

export const requireRole=(role:"admin" | "user")=>{
    return async(req:AuthRequest,res:Response,next:NextFunction)=>{
        const user=await User.findById(req.user);

        if(!user || user.role!==user.role){
            return res.status(403).json({error:"Forbidden"});
        }

        next();
    };
};