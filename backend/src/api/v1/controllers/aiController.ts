import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Resume from "../../../models/Resume";
import JobApplication from "../../../models/JobApplication";
import { logger } from "../../../utils/logger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const analyzeResumeMatch = async (
  req: Request,
  res: Response
) => {
  try {
    const { jobId, resumeId } = req.body;

    if (!jobId || !resumeId) {
      return res.status(400).json({
        message: "jobId and resumeId required",
      });
    }

    const job = await JobApplication.findById(jobId);
    const resume = await Resume.findById(resumeId);

    if (!job || !resume) {
      return res.status(404).json({ message: "Job or Resume not found" });
    }

    // 🔥 Prevent duplicate comparison
    const alreadyCompared = job.comparisons?.find(
      (c: any) => c.resume.toString() === resumeId
    );

    if (alreadyCompared) {
      return res.json(job);
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
You are a strict Applicant Tracking System.

Compare the resume against the job description.
Penalize missing core requirements heavily.

Return JSON ONLY in this format:
{
  "score": number (0-100),
  "strengths": string[],
  "missingSkills": string[],
  "suggestions": string[]
}

Job Description:
${job.description}

Resume:
${resume.extractedText}
`;
let parsed;
try {
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response?.text() ?? "";
  const cleaned = text.replace(/```json|```/g, "").trim();
  parsed = JSON.parse(cleaned);
} catch (err) {
  req.log?.info("AI Parsing Error:");
  req.log?.error(err);
  return res.status(500).json({ message: "AI parsing failed" });
}

    if (!parsed || typeof parsed.score !== "number") {
      return res.status(500).json({ message: "Invalid AI output" });
    }
    job.comparisons=job.comparisons||[];
    job.comparisons.push({
      resume: resume._id,
      ...parsed,
      analyzedAt: new Date(),
    });

    await job.save();

    const updatedJob = await JobApplication.findById(jobId)
      .populate("comparisons.resume");

    res.json(updatedJob);
  } catch (error) {
    req.log?.info("AI Error:");
    req.log?.error(error);
    res.status(500).json({ message: "AI analysis failed" });
  }
};
