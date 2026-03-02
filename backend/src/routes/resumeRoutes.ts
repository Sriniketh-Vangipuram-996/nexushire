import express from "express";
import {
  uploadResume,
  getResumes,
  setDefaultResume,
  deleteResume,
} from "../controllers/resumeController";

import {protect} from "../middleware/protect";
import {uploadResume as upload} from "../utils/upload";

const router = express.Router();

/* =========================================
   Routes
========================================= */

// Upload new resume
router.post(
  "/",
  protect,
  upload.single("resume"),
  uploadResume
);

// Get all resumes
router.get("/", protect, getResumes);

// Set default resume
router.patch("/:id/default", protect, setDefaultResume);

// Delete resume
router.delete("/:id", protect, deleteResume);

export default router;
