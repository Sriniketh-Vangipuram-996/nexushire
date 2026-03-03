import Redis from "ioredis";

const redis=new Redis();

export const ensureIdempotent=async(key:string,ttl=300)=>{
    const result=await redis.set(key,"1","EX",ttl,"NX");

    if(!!result){
        throw new Error("Duplicate operation detected.");
    }
};