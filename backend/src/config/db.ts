import mongoose  from "mongoose";
import { logger } from "../utils/logger";

const connectDB=async()=>{
    const uri=process.env.MONGO_URI!;
    await mongoose.connect(uri);
    logger.info("Mongodb Connected.");
}

export default connectDB;