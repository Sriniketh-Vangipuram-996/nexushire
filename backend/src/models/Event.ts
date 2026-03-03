import mongoose from "mongoose";

const eventSchema=new mongoose.Schema(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        eventType:{
            type:String,
            required:true,
        },

        metadata:{
            type:Object,
        },
    },
    {timestamps:true}
);

export default mongoose.model("Event",eventSchema);