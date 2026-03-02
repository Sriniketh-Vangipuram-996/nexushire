import redisClient from "../config/redis";
import crypto from "crypto";

const CACHE_VERSION="v1";

function hashQuery(query:any){
    return crypto
        .createHash("md5")
        .update(JSON.stringify(query))
        .digest("hex");
}


export function buildCacheKey(
    tenantId:string,
    userId:string,
    endpoint:string,
    query:any
){
    const env=process.env.NODE_ENV||"dev";
    const queryHash=hashQuery(query);

    return `nexushire:${env}:${CACHE_VERSION}:${tenantId}:${userId}:${endpoint}:${queryHash}`;
}

export async function getCache(key:string){
    const data=await redisClient.get(key);
    return data?JSON.parse(data):null;
}

//if many requests hit empty cache simulataneously, they all hit DB So:
// Add some short random jitter to TTL:

export async function setCache(key:string,value:any,ttl:number){
    await redisClient.setex(key,ttl + Math.floor(Math.random()*10),JSON.stringify(value));
}

export async function deleteCacheByPattern(pattern:string){
    const keys=await redisClient.keys(pattern);
    if(keys.length){
        await redisClient.del(keys);
    }
}