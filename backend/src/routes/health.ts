import Router from "express";
import mongoose, { mongo } from "mongoose";
import { publisher } from "../common/utils/redisPubSub";
import { emailQueue } from "../queues/emailQueue";


const router=Router();

router.get("/health",async(_req,res)=>{
    const services:Record<string,string>={
        mongodb:"down",
        redis:"down",
        queue:"down",
    };

    if(mongoose.connection.readyState===1){
        services.mongodb="up";
    }

    if(publisher.status==="ready"){
        services.redis="up";
    }

    try{
        await emailQueue.getJobCounts();
        services.queue="up";
    }
    catch{
        services.queue="down";
    }

    const allUp=Object.values(services).every((s)=>s==="up");

    return res.status(allUp?200:503).json({
        status:allUp?"ok":"degraded",
        timestamp:new Date().toISOString(),
        services,
    });
});

export default router;