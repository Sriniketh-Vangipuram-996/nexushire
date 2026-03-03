import {Request,Response,NextFunction}from "express";
import { buildCacheKey,getCache,setCache } from "../utils/cache";
import { success } from "zod";

export function cache(ttl:number){
    return async(req:Request,res:Response,next:NextFunction)=>{
        if(req.method!=="GET"){
            return next();
        }

        if(!req.user){
            return next();
        }
        const tenantId=req.headers["tenant-id"] ;
        if(!tenantId || typeof tenantId !== "string"){
            return res.status(400).json({
                success:false,
                message:"Tenant ID missing"
            });
        }
        const userId=req.user.userId;

        const key=buildCacheKey(
            tenantId,
            userId,
            req.baseUrl+req.path,
            req.query
        );

        const cachedData=await getCache(key);
        if(cachedData){
            return res.json({
                source:"cache",
                ...cachedData,
            });
        }

        //override res.json to capture response
        const originalJson=res.json.bind(res);

        res.json=(body:any)=>{
            setCache(key,body,ttl).catch(()=>{});
            return originalJson(body);
        };

        next();
    }
}