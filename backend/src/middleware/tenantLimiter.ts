import { Request,Response,NextFunction } from "express";
import Redis from "ioredis";
import { success } from "zod";


const redis=new Redis({
    host:process.env.REDIS_HOST,
    port:Number(process.env.REDIS_PORT),
});

export const tenantSlidingLimiter=(windowMs:number,max:number)=>{
    return async(req:Request,res:Response,next:NextFunction)=>{
        const tenantId=req.user?.tenantId;
        if(!tenantId){
            return res.status(401).json({message:"UnAuthorized"});
        }

        const key=`tenant:${tenantId}`;
        const now=Date.now();
        const windowStart=now-windowMs;

        await redis.zremrangebyscore(key,0,windowStart);

        const count=await redis.zcard(key);
        if(count>=max){
            return res.status(429).json({
                success:false,
                message:"Tenant rate limit exceeded"
            })
        }

        await redis.zadd(key,now,`${now}`);
        await redis.expire(key,Math.ceil(windowMs/1000));

        next();
    }
}