import { Router } from "express";
import authRoutes from "./routes/auth";
import resumeRoutes from "./routes/resumeRoutes"
import aiRoutes from "./routes/aiRoutes";
import userRoutes from "./routes/user";
import express from "express";
import jobRoutes from "./routes/jobs";
import analyticsRoutes from "./routes/analyticsRoutes";
import eventRoutes from "./routes/eventRoutes";
import adminRoutes from "./routes/admin";
import notificationRoutes from "./routes/notificationRoutes";
import reminderRoutes from "./routes/reminderRoutes";
import healthRoutes from "./routes/health"
import path from "path";


const router = Router();

router.use("/auth", authRoutes);
router.use("/resume", resumeRoutes);
router.use("/user",userRoutes);
router.use("/ai",aiRoutes);
router.use("/api/jobs",jobRoutes);
router.use("/api/user", userRoutes); 
router.use("/api/resumes",resumeRoutes);
router.use("/api/ai",aiRoutes);
router.use("/api/analytics", analyticsRoutes);
router.use("/api/events",eventRoutes);
router.use("/api/admin",adminRoutes);
router.use("/api/notifications",notificationRoutes);
router.use("/api/reminders",reminderRoutes);
router.use("/uploads",express.static(path.join(__dirname,"../uploads")));
router.use(healthRoutes);
router.use((req,res,next)=>{
    res.setHeader("X-API-Deprecated","true");
    next();
})
export default router;