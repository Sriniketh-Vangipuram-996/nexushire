import express from "express";
import { protect } from "../../../middleware/protect";
import { authorize } from "../../../middleware/authorize";
import { Role } from "../../../models/User";
import {
  uploadResume,
  updateProfile,
  uploadAvatarController,
} from "../controllers/userController";
import {
  uploadResume as uploadResumeMulter,
  uploadAvatar,
} from "../../../utils/upload";
import { optimizeAvatarMiddleware } from "../../../middleware/optimizeImageMiddleware";

const router = express.Router();

// Every route requires authenticated USER
router.use(protect, authorize(Role.USER));

// Resume
router.post(
  "/resume",
  uploadResumeMulter.single("resume"),
  uploadResume
);

// Avatar
router.post(
  "/avatar",
  uploadAvatar.single("avatar"),
  optimizeAvatarMiddleware,
  uploadAvatarController
);

// Profile
router.put("/profile", updateProfile);

export default router;