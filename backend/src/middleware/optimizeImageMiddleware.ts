import { Request, Response, NextFunction } from "express";
import sharp from "sharp";
import path from "path";
import fs from "fs";

export const optimizeAvatarMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) return next();

    const filePath = req.file.path;
    const ext = path.extname(filePath);
    const baseName = path.basename(filePath, ext);

    const optimizedPath = path.join(
      path.dirname(filePath),
      `${baseName}.webp`
    );

    await sharp(filePath)
      .resize(512) // avatars don't need 1200px
      .webp({ quality: 80 })
      .toFile(optimizedPath);

    // remove original file
    fs.unlinkSync(filePath);

    // update file info for next middleware
    req.file.filename = `${baseName}.webp`;
    req.file.path = optimizedPath;

    next();
  } catch (err) {
    next(err);
  }
};