import Resume from "../../../models/Resume";
import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import { extractResumeText } from "../../../utils/extractResumeText";
import JobApplication from "../../../models/JobApplication";
import { notificationQueue } from "../../../queues/notificationQueue";
import { logger } from "../../../utils/logger";


export const uploadResume = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = path.join(process.cwd(), "uploads", req.file.filename);

    let extractedText = "";

    try {
      extractedText = await extractResumeText(filePath);
    } catch (err) {
      req.log?.info("Extraction error:");
      req.log?.error(err);
      return res.status(400).json({
        message: "Resume text extraction failed. Please upload a readable PDF or DOCX.",
      });
    }

    // 🚨 IMPORTANT CHECK
    if (!extractedText || extractedText.trim().length < 30) {
      return res.status(400).json({
        message: "Could not extract readable text from resume. Please upload a proper resume file.",
      });
    }

    const resume = await Resume.create({
      user: req.user?.userId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      extractedText,
    });

    //Add notification to BullMQ queue
    await notificationQueue.add("resumeComplete",{
      userId:req.user?.userId,
      message:"Your resume analysis is complete",
      type:"success",
    });

    //Resume -> Queue -> Worker ->MongoDB notification

    res.status(201).json(resume);
  } catch (error) {
    req.log?.info("UPLOAD ERROR:");
    req.log?.error(error);
    res.status(500).json({ message: "Upload failed" });
  }
};

/* =========================================
   2️⃣ Get All User Resumes
========================================= */
export const getResumes = async (req:Request, res:Response) => {
  try {
    const resumes = await Resume.find({ user: req.user?.userId })
      .sort({ createdAt: -1 });

    res.json(resumes);
  } catch {
    res.status(500).json({ message: "Failed to fetch resumes" });
  }
};

/* =========================================
   3️⃣ Set Default Resume
========================================= */
export const setDefaultResume = async (req:Request, res:Response) => {
  try {
    const { id } = req.params;

    // Reset all to false
    await Resume.updateMany(
      { user: req.user?.userId },
      { isDefault: false }
    );

    const resume = await Resume.findOneAndUpdate(
      { _id: id, user: req.user?.userId },
      { isDefault: true },
      { new: true }
    );

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.json(resume);
  } catch {
    res.status(500).json({ message: "Failed to update default resume" });
  }
};

/* =========================================
   4️⃣ Delete Resume
========================================= */
export const deleteResume = async (req:Request, res:Response) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user?.userId,
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    /* 🚨 Prevent deleting if used by any job */
    const jobUsingResume = await JobApplication.findOne({
        resume: resume._id,
    });

    if (jobUsingResume) {
      return res.status(400).json({
        message: "Cannot delete resume. It is attached to a job.",
      });
    }

    // Delete file from uploads folder
    const filePath = path.join(
      process.cwd(),
      "uploads",
      resume.filename
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await resume.deleteOne();

    res.json({ message: "Resume deleted successfully" });
  } catch (error){
    req.log?.info("Delete from resume error:");
    req.log?.error(error);
    res.status(500).json({ message: "Delete failed" });
  }
};
