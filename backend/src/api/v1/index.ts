import { Router } from "express";
import express from "express";
import path from "path";

import authRoutes from "./routes/auth";
import resumeRoutes from "./routes/resumeRoutes";
import userRoutes from "./routes/user";
import aiRoutes from "./routes/aiRoutes";

import jobRoutes from "./routes/jobs";
import analyticsRoutes from "./routes/analyticsRoutes";
import eventRoutes from "./routes/eventRoutes";
import adminRoutes from "./routes/admin";
import notificationRoutes from "./routes/notificationRoutes";
import reminderRoutes from "./routes/reminderRoutes";
import healthRoutes from "./routes/health";

const router = Router();

// Auth
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/resume", resumeRoutes);
router.use("/ai", aiRoutes);

// Main features
router.use("/jobs", jobRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/events", eventRoutes);
router.use("/admin", adminRoutes);
router.use("/notifications", notificationRoutes);
router.use("/reminders", reminderRoutes);

// Static files
router.use(
  "/uploads",
  express.static(path.join(__dirname, "../../../uploads"))
);

// Health
router.use("/health", healthRoutes);

router.use((req, res, next) => {
  res.setHeader("X-API-Deprecated", "false");
  next();
});

export default router;