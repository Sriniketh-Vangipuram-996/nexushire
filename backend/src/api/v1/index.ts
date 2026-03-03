import { Router } from "express";
import authRoutes from "./routes/auth";
import resumeRoutes from "./routes/resumeRoutes"
import aiRoutes from "./routes/aiRoutes";
import userRoutes from "./routes/user";

const router = Router();

router.use("/auth", authRoutes);
router.use("/resume", resumeRoutes);
router.use("/user",userRoutes);
router.use("/ai",aiRoutes);
router.use((req,res,next)=>{
    res.setHeader("X-API-Deprecated","true");
    next();
})
export default router;