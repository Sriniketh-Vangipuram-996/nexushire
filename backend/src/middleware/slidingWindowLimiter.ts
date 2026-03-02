import {Request,Response,NextFunction} from "express";
import Redis from "ioredis";
import { success } from "zod";

const redis=new Redis({
    host:process.env.REDIS_HOST,
    port:Number(process.env.REDIS_PORT),
});

export const slidingWindowLimiter=(windowMs:number,max:number)=>{
    return async(req:Request,res:Response,next:NextFunction)=>{
        const key=`sliding:${req.ip}`;
        const now=Date.now();
        const windowStart=now-windowMs;

        //Remove old timestamps
        await redis.zremrangebyscore(key,0,windowStart);

        //Count requests inside window
        const count=await redis.zcard(key);

        if(count>=max){
            return res.status(429).json({
                success:false,
                message:"Too many requests (Sliding Window)",
            });
        }

        // Add new request timestamp
        await redis.zadd(key,now,`${now}`);

        //Set Expiration
        await redis.expire(key,Math.ceil(windowMs/1000));

        next();
    }
}