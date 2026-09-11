import { Request,Response,NextFunction } from "express";
import Redis from "ioredis";


const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

export const tokenBucketLimiter=(capacity:number,refillRatePerSecond:number)=>{
    return async (req:Request,res:Response,next:NextFunction)=>{
        const key=`bucket:${req.ip}`;
        const now=Date.now();

        const data=await redis.hmget(key,"tokens","lastRefill");

        let tokens=parseFloat(data[0]||`${capacity}`);
        let lastRefill=parseInt(data[1]||`${now}`);

        const timePassed=(now-lastRefill)/1000;
        const refill=timePassed*refillRatePerSecond;

        tokens=Math.min(capacity,tokens+refill);

        if(tokens<1){
            return res.status(429).json({
                success:false,
                message:"Too many requests (Token Bucket)",
            });
        }

        tokens-=1;

        await redis.hmset(key,{
            tokens,
            lastRefill:now,
        });

        await redis.expire(key,60);
        next();
    }
}