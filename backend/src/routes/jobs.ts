import express from "express";
import {
  createJobApplication,
  getMyJobs,
  getJobById,
  updateJobStatus,
  deleteJobApplication,
  bulkUpdateStatus,
  bulkDeleteJobs,
  attachResumeToJob,
  deleteJobResume,
  uploadResumeToJob
} from "../controllers/jobController";
import { protect } from "../common/middleware/protect";
import { uploadResume as uploadResumeMulter } from "../common/utils/upload";
import { cache } from "../common/middleware/cacheMiddleware";
import { tokenBucketLimiter } from "../common/middleware/tokenBucketLimiter";
import { tenantSlidingLimiter } from "../common/middleware/tenantLimiter";


const router = express.Router();

router.post("/", protect,tenantSlidingLimiter(60*1000,50), createJobApplication);
router.get("/",protect,tokenBucketLimiter(20,2),cache(60),getMyJobs);
router.patch("/bulk/status",protect,tenantSlidingLimiter(60*1000,50),bulkUpdateStatus);
router.delete("/bulk",protect,tenantSlidingLimiter(60*1000,50),bulkDeleteJobs);

router.get("/:id",protect,getJobById);
router.patch("/:id/status",protect,tenantSlidingLimiter(60*1000,50),updateJobStatus);
router.delete("/:id",protect,tenantSlidingLimiter(60*1000,50),deleteJobApplication);
router.post("/:id/resume", protect, uploadResumeMulter.single("resume"), uploadResumeToJob);
router.delete("/:id/resume", protect, deleteJobResume);
router.patch("/:id/attach-resume",protect,attachResumeToJob);

export default router;
