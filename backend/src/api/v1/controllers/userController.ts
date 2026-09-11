import User from "../../../models/User";

// Upload Resume
export const uploadResume = async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.resume = req.file.filename;
    await user.save();

    res.json({
      message: "Resume uploaded successfully",
      resume: user.resume,
    });
  } catch (err: any) {
    res.status(500).json({
      error: err.message || "Upload failed.",
    });
  }
};

// Update Profile
export const updateProfile = async (req: any, res: any) => {
  try {
    const { name, phone, linkedin, github, leetcode } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.name = name;
    user.phone = phone;
    user.linkedin = linkedin;
    user.github = github;
    user.leetcode = leetcode;

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: err.message || "Profile update failed",
    });
  }
};

// Upload Avatar
export const uploadAvatarController = async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No avatar uploaded" });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.avatar = req.file.filename;
    await user.save();

    return res.json({
      message: "Avatar updated",
      avatar: user.avatar,
      user,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: err.message || "Avatar upload failed",
    });
  }
};