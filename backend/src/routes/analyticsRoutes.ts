import express from "express";
import { getDashboardAnalytics } from "../controllers/analyticsController";
import { protect } from "../middleware/protect";
import { cache } from "../middleware/cacheMiddleware";
import { tokenBucketLimiter } from "../middleware/tokenBucketLimiter";

const router = express.Router();

router.get("/dashboard", protect, cache(60),tokenBucketLimiter(20,2),getDashboardAnalytics);

export default router;
