import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import cookieParser from "cookie-parser";
import jobRoutes from "./routes/jobs";
import userRoutes from "./routes/user";
import path from "path";
import resumeRoutes from "./routes/resumeRoutes";
import aiRoutes from "./routes/aiRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import eventRoutes from "./routes/eventRoutes";
import adminRoutes from "./routes/admin";
import notificationRoutes from "./routes/notificationRoutes";
import reminderRoutes from "./routes/reminderRoutes";
import healthRoutes from "./routes/health"
import { httpLogger } from "./middleware/logger";
import { requestIdMiddleware } from "./middleware/requestId";
import { requestLogger } from "./middleware/requestLogger";
import { globalRateLimiter } from "./middleware/rateLimiter";
import {register} from "./metrics/metrics";
import { metricsMiddleware } from "./middleware/metricsMiddleware";

const app=express();

app.use(cors({origin:process.env.FRONTEND_URL,credentials:true}));
app.use(express.json());
app.use(httpLogger);
app.use(cookieParser());
app.use(requestIdMiddleware);
app.use(requestLogger);
app.use(globalRateLimiter); // Apply global rate limiter to all routes
app.use(metricsMiddleware);
//Routes..
app.use("/api/auth",authRoutes);
app.use("/api/jobs",jobRoutes);
app.use("/api/user", userRoutes); 
app.use("/api/resumes",resumeRoutes);
app.use("/api/ai",aiRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/events",eventRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/notifications",notificationRoutes);
app.use("/api/reminders",reminderRoutes);
app.use("/uploads",express.static(path.join(__dirname,"../uploads")));
app.get("/metrics",async(req,res)=>{
    res.set("Content-Type",register.contentType);
    res.end(await register.metrics());
})
app.use(healthRoutes);
export default app;