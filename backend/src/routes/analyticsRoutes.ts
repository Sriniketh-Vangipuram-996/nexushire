import express from "express";
import { getDashboardAnalytics } from "../controllers/analyticsController";
import { protect } from "../common/middleware/protect";
import { cache } from "../common/middleware/cacheMiddleware";
import { tokenBucketLimiter } from "../common/middleware/tokenBucketLimiter";

const router = express.Router();

router.get("/dashboard", protect, cache(60),tokenBucketLimiter(20,2),getDashboardAnalytics);

export default router;
