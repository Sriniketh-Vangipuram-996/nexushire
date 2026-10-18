
import { Request, Response } from "express";
import * as bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../../../models/User";
import { Tenant } from "../../../models/Tenant";
import { AuthRequest } from "../../../middleware/auth";
import {
  signAccessToken,
  signRefreshToken,
} from "../../../utils/jwt";
import { signEmailToken } from "../../../utils/emailToken";
import { sendVerificationEmail } from "../../../utils/sendEmail";
import { signResetToken } from "../../../utils/resetToken";
import { sendResetPasswordEmail } from "../../../utils/sendResetEmail";
import { createAuditLog } from "../../../services/auditService";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}|:<>?]).{8,}$/;

// Cookie settings are kept in this controller; no new file is required.
const isProduction = process.env.NODE_ENV === "production";

const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ("none" as const) : ("lax" as const),
  path: "/",
};

const accessCookieOptions = {
  ...authCookieOptions,
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const refreshCookieOptions = {
  ...authCookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ---------------- SIGNUP ----------------

export const signup = async (req: Request, res: Response) => {
  try {
    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const password =
      typeof req.body.password === "string"
        ? req.body.password.trim()
        : "";

    if (
      !email ||
      !password ||
      !emailRegex.test(email) ||
      !passwordRegex.test(password)
    ) {
      return res.status(400).json({
        error:
          "Password must be 8+ characters with uppercase, lowercase, number, and special character.",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        error: "Account already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const tenant = await Tenant.create({
      name: `${email}'s Workspace`,
    });

    if (!tenant?._id) {
      return res.status(500).json({
        error: "Tenant creation failed. Please try again.",
      });
    }

    const user = await User.create({
      email,
      passwordHash,
      emailVerified: process.env.NODE_ENV === "test",
      tenantId: tenant._id,
    });

    const token = signEmailToken(user._id.toString());

    try {
      await sendVerificationEmail(user.email, token);
    } catch (error) {
      req.log?.error(error, "Verification email sending failed");
    }

    return res.status(201).json({
      message:
        "Account created. Please verify your email before logging in.",
    });
  } catch (error) {
    req.log?.error(error, "Signup failed");

    return res.status(500).json({
      error: "Something went wrong. Please try again.",
    });
  }
};

// ---------------- LOGIN ----------------

export const login = async (req: Request, res: Response) => {
  try {
    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const password =
      typeof req.body.password === "string"
        ? req.body.password
        : "";

    if (!email || !password) {
      return res.status(400).json({
        error: "Missing credentials.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        error: "Please verify your email before logging in.",
      });
    }

    await createAuditLog({
      actorId: user._id.toString(),
      action: "USER_LOGIN",
      targetType: "User",
      targetId: user._id.toString(),
      ip: req.ip,
      requestId: req.requestId,
    });

    const accessToken = signAccessToken(
      user._id.toString(),
      user.role,
      user.tenantId.toString()
    );

    const refreshToken = signRefreshToken(
      user._id.toString(),
      user.role,
      user.tenantId.toString()
    );

    return res
      .cookie("access_token", accessToken, accessCookieOptions)
      .cookie("refresh_token", refreshToken, refreshCookieOptions)
      .status(200)
      .json({
        message: "Login successful",
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
          tenantId: user.tenantId,
          name: user.name,
          phone: user.phone,
          linkedin: user.linkedin,
          github: user.github,
          leetcode: user.leetcode,
          avatar: user.avatar,
          resume: user.resume,
        },
      });
  } catch (error) {
    req.log?.error(error, "Login failed");

    return res.status(500).json({
      error: "Something went wrong. Please try again.",
    });
  }
};

// ---------------- CURRENT USER ----------------

export const me = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "_id email role emailVerified tenantId resume name phone linkedin github leetcode avatar"
    );

    if (!user) {
      return res.status(401).json({
        error: "User not found.",
      });
    }

    return res.status(200).json({ user });
  } catch (error) {
    req.log?.error(error, "Fetching current user failed");

    return res.status(500).json({
      error: "Could not retrieve the current user.",
    });
  }
};

// ---------------- REFRESH SESSION ----------------

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refresh_token;

  if (!refreshToken) {
    return res.status(401).json({
      error: "No refresh token.",
    });
  }

  try {
    const secret = process.env.JWT_REFRESH_SECRET;

    if (!secret) {
      req.log?.error("JWT_REFRESH_SECRET is not configured");

      return res.status(500).json({
        error: "Authentication configuration error.",
      });
    }

    const payload = jwt.verify(
      refreshToken,
      secret
    ) as { userId: string };

    const user = await User.findById(payload.userId).select(
      "-passwordHash"
    );

    if (!user) {
      return res.status(401).json({
        error: "User not found.",
      });
    }

    const newAccessToken = signAccessToken(
      user._id.toString(),
      user.role,
      user.tenantId.toString()
    );

    res.cookie(
      "access_token",
      newAccessToken,
      accessCookieOptions
    );

    return res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        tenantId: user.tenantId,
        name: user.name,
        phone: user.phone,
        linkedin: user.linkedin,
        github: user.github,
        leetcode: user.leetcode,
        avatar: user.avatar,
        resume: user.resume,
      },
    });
  } catch (error) {
    // Do not log the token itself.
    req.log?.info("Refresh token validation failed");

    return res.status(401).json({
      error: "Invalid or expired refresh token.",
    });
  }
};

// ---------------- LOGOUT ----------------

export const logout = (_req: Request, res: Response) => {
  return res
    .clearCookie("access_token", authCookieOptions)
    .clearCookie("refresh_token", authCookieOptions)
    .status(200)
    .json({ message: "Logged out" });
};

// ---------------- VERIFY EMAIL ----------------

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (typeof token !== "string" || !token) {
    return res.status(400).json({
      error: "Verification token missing.",
    });
  }

  try {
    const secret = process.env.JWT_EMAIL_SECRET;

    if (!secret) {
      req.log?.error("JWT_EMAIL_SECRET is not configured");

      return res.status(500).json({
        error: "Email verification is not configured.",
      });
    }

    const payload = jwt.verify(token, secret) as {
      userId: string;
    };

    const user = await User.findById(payload.userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    if (user.emailVerified) {
      return res.status(200).json({
        message: "Email already verified.",
      });
    }

    user.emailVerified = true;
    await user.save();

    return res.status(200).json({
      message: "Email verified successfully.",
    });
  } catch {
    return res.status(400).json({
      error: "Invalid or expired verification link.",
    });
  }
};

// ---------------- REQUEST PASSWORD RESET ----------------

export const requestPasswordReset = async (
  req: Request,
  res: Response
) => {
  try {
    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    if (email && emailRegex.test(email)) {
      const user = await User.findOne({ email });

      if (user) {
        const token = signResetToken(user._id.toString());

        const frontendUrl = process.env.FRONTEND_URL;

        if (!frontendUrl) {
          req.log?.error("FRONTEND_URL is not configured");

          return res.status(500).json({
            error: "Password reset is not configured.",
          });
        }

        const link =
          `${frontendUrl.replace(/\/$/, "")}/reset-password` +
          `?token=${encodeURIComponent(token)}`;

        try {
          await sendResetPasswordEmail(user.email, link);
        } catch (error) {
          req.log?.error(error, "Password reset email sending failed");
        }
      }
    }

    // Avoid disclosing whether an email address has an account.
    return res.status(200).json({
      message:
        "If an account with that email exists, a reset link has been sent.",
    });
  } catch (error) {
    req.log?.error(error, "Password reset request failed");

    return res.status(500).json({
      error: "Could not process the password reset request.",
    });
  }
};

// ---------------- RESET PASSWORD ----------------

export const resetPassword = async (
  req: Request,
  res: Response
) => {
  const { token, newPassword } = req.body;

  if (
    typeof token !== "string" ||
    !token ||
    typeof newPassword !== "string" ||
    !newPassword
  ) {
    return res.status(400).json({
      error: "Missing fields.",
    });
  }

  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      error:
        "Password must be 8+ characters with uppercase, lowercase, number, and special character.",
    });
  }

  try {
    const secret = process.env.JWT_RESET_SECRET;

    if (!secret) {
      req.log?.error("JWT_RESET_SECRET is not configured");

      return res.status(500).json({
        error: "Password reset is not configured.",
      });
    }

    const payload = jwt.verify(token, secret) as {
      userId: string;
    };

    const passwordHash = await bcrypt.hash(newPassword, 10);

    const user = await User.findByIdAndUpdate(
      payload.userId,
      { passwordHash },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    return res.status(200).json({
      message: "Password updated successfully.",
    });
  } catch {
    return res.status(400).json({
      error: "Invalid or expired reset token.",
    });
  }
};
