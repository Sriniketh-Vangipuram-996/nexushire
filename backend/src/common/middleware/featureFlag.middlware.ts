import { Request,Response,NextFunction } from "express";
import { FeatureFlagService } from "../../services/featureFlag.service";

export const requireFeature=(key:string)=>{
    return async(req:Request,res:Response,next:NextFunction)=>{
        const enabled=await FeatureFlagService.isEnabled(key);

        if(!enabled){
            return res.status(403).json({
                message:`Feature ${key} is disabled`,
            });
        }

        next();
    };
};
