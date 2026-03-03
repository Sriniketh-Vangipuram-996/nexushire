import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import cookieParser from "cookie-parser";
import jobRoutes from "./routes/jobs";
import userRoutes from "./routes/user";
import path from "path";
import resumeRoutes from "../src/routes/resumeRoutes";
import aiRoutes from "../src/routes/aiRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import eventRoutes from "../src/routes/eventRoutes";
import adminRoutes from "../src/routes/admin";
import notificationRoutes from "../src/routes/notificationRoutes";
import reminderRoutes from "../src/routes/reminderRoutes";
import healthRoutes from "./routes/health"
import { httpLogger } from "./common/middleware/logger";
import { requestIdMiddleware } from "./common/middleware/requestId";
import { requestLogger } from "./common/middleware/requestLogger";
import { globalRateLimiter } from "./common/middleware/rateLimiter";
import v1Routes from "./api/v1";
import v2Routes from "./api/v2";

const app=express();

app.use(cors({origin:process.env.FRONTEND_URL,credentials:true}));
app.use(express.json());
app.use(httpLogger);
app.use(cookieParser());
app.use(requestIdMiddleware);
app.use(requestLogger);
app.use(globalRateLimiter); // Apply global rate limiter to all routes
//Routes..

app.use("/api/v1",v1Routes);
app.use("/api/v2",v2Routes);
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
app.use(healthRoutes);
export default app;