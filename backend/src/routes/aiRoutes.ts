import express from "express";
import { protect } from "../common/middleware/protect";
import { analyzeResumeMatch } from "../controllers/aiController";
import { requireFeature } from "../common/middleware/featureFlag.middlware";

const router = express.Router();

router.post("/analyze", protect, requireFeature("AI_RESUME"),analyzeResumeMatch);

export default router;
