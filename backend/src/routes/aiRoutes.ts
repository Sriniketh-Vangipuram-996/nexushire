import express from "express";
import { protect } from "../middleware/protect";
import { analyzeResumeMatch } from "../controllers/aiController";

const router = express.Router();

router.post("/analyze", protect, analyzeResumeMatch);

export default router;
