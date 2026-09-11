import type { Resume } from "./resume";

export interface Job {
  _id: string;
  companyName: string;
  role: string;
  description: string;
  status: "Applied" | "Interviewed" | "Rejected" | "Offer";
  appliedDate: string;
  notes?: string;
  resume?: Resume; // attached resume
  comparisons?: {
    resume: Resume;
    score: number;
    strengths: string[];
    missingSkills: string[];
    suggestions: string[];
    analyzedAt: string; // use string since JSON from API
  }[];
}
