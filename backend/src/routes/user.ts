import { uploadResume as uploadResumeController } from "../controllers/userController";
import { protect } from "../middleware/protect";
import express from "express";
import User from "../models/User";
import { uploadResume as uploadResumeMulter,uploadAvatar } from "../utils/upload";
import { authorize } from "../middleware/authorize";
import { Role } from "../models/User";
import { logger } from "../utils/logger";
import { optimizeAvatarMiddleware } from "../middleware/optimizeImageMiddleware";

const router=express.Router();
router.use(protect,authorize(Role.USER));
router.post("/resume", uploadResumeMulter.single("resume"), uploadResumeController);
router.post(
  "/avatar",
  protect,
  uploadAvatar.single("avatar"),
  optimizeAvatarMiddleware,
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });

      const user = await User.findById(req.user!.userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      user.avatar = req.file.filename;
      await user.save();

      res.json({ avatar: user.avatar });
    } catch (err) {
      logger.info("Avatar upload error:");
      logger.error(err);
      res.status(500).json({ error: "Avatar upload failed" });
    }
  }
);
router.put("/profile", protect, async (req, res) => {
  const { name, phone, linkedin, github, leetcode } = req.body;

  const user = await User.findById(req.user?.userId);

  if (!user) return res.status(404).json({ error: "User not found" });

  user.name = name;
  user.phone = phone;
  user.linkedin = linkedin;
  user.github = github;
  user.leetcode = leetcode;

  await user.save();

  res.json({ user });
});

router.delete("/resume", protect, async (req, res) => {
  const user = await User.findById(req.user?.userId);

  if (!user) return res.status(404).json({ error: "User not found" });

  user.resume = null;
  await user.save();

  res.json({ message: "Resume deleted" });
});

export default router;