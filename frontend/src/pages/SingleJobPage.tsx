import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/axios";
import { toast } from "react-toastify";
import type { Job } from "../types/job";
import type { Resume } from "../types/resume";

interface Comparison {
  resume: Resume;
  score: number;
  strengths: string[];
  missingSkills: string[];
  suggestions: string[];
  analyzedAt: string | Date;
}

const SingleJobPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedResumeIds, setSelectedResumeIds] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [jobRes, resumeRes] = await Promise.all([
          api.get(`/jobs/${id}`),
          api.get("/resume"),
        ]);

        setJob(jobRes.data);
        setResumes(resumeRes.data);
      } catch {
        toast.error("Failed to load job details");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const toggleResume = (resumeId: string) => {
    setSelectedResumeIds((prev) =>
      prev.includes(resumeId)
        ? prev.filter((id) => id !== resumeId)
        : [...prev, resumeId]
    );
  };

  const handleAnalyze = async () => {
    if (!job) return;

    if (selectedResumeIds.length === 0) {
      toast.error("Select at least one resume");
      return;
    }

    try {
      setAnalyzing(true);

      await Promise.all(
        selectedResumeIds.map((resumeId) =>
          api.post("/ai/analyze", {
            jobId: job._id,
            resumeId,
          })
        )
      );

      const updated = await api.get(`/jobs/${job._id}`);
      setJob(updated.data);

      setSelectedResumeIds([]);
      toast.success("AI analysis completed!");
    } catch {
      toast.error("Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Applied":
        return "bg-blue-100 text-blue-700";
      case "Interviewed":
        return "bg-amber-100 text-amber-700";
      case "Offer":
        return "bg-emerald-100 text-emerald-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-500">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Job not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Hero */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-xl">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-100 hover:text-white mb-6"
          >
            ← Back
          </button>

          <div className="flex flex-col lg:flex-row justify-between gap-8">
            <div>
              <p className="uppercase tracking-wider text-sm text-blue-100">
                Job Application
              </p>

              <h1 className="text-4xl font-bold mt-2">{job.role}</h1>

              <p className="text-xl text-blue-100 mt-2">{job.companyName}</p>

              <div className="flex flex-wrap gap-3 mt-5">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                    job.status
                  )}`}
                >
                  {job.status}
                </span>

                <span className="px-3 py-1 rounded-full bg-white/20 text-sm">
                  {new Date(job.appliedDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 min-w-[220px]">
              <p className="text-blue-100 text-sm">AI Analyses</p>

              <h2 className="text-5xl font-bold mt-2">
                {job.comparisons?.length || 0}
              </h2>

              <p className="text-blue-100 text-sm mt-2">
                Resume comparisons completed
              </p>
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-5">Job Description</h2>

          <p className="text-slate-600 whitespace-pre-wrap leading-7">
            {job.description || "No description available."}
          </p>
        </div>

        {/* Resume Selection */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">AI Resume Matcher</h2>
              <p className="text-slate-500">
                Select one or more resumes to compare.
              </p>
            </div>

            <span className="text-sm text-slate-500">
              {selectedResumeIds.length} selected
            </span>
          </div>

          {resumes.length === 0 ? (
            <div className="border-2 border-dashed rounded-2xl p-12 text-center text-slate-500">
              No resumes uploaded.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {resumes.map((resume) => {
                const selected = selectedResumeIds.includes(resume._id);

                return (
                  <div
                    key={resume._id}
                    onClick={() => toggleResume(resume._id)}
                    className={`rounded-2xl border p-5 cursor-pointer transition ${
                      selected
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{resume.originalName}</h3>

                        {resume.isDefault && (
                          <span className="inline-block mt-2 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs">
                            Default
                          </span>
                        )}
                      </div>

                      <input
                        type="checkbox"
                        checked={selected}
                        readOnly
                        className="h-5 w-5 accent-blue-600"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={analyzing || resumes.length === 0}
            className="w-full mt-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 font-semibold transition"
          >
            {analyzing ? "Analyzing..." : "Analyze Selected Resumes"}
          </button>
        </div>

        {/* AI Results */}
        {job.comparisons && job.comparisons.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">AI Comparison Results</h2>

            {[...job.comparisons]
              .sort((a: Comparison, b: Comparison) => b.score - a.score)
              .map((comp: Comparison, index) => (
                <div
                  key={index}
                  className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm"
                >
                  <div className="flex flex-col lg:flex-row justify-between gap-8 mb-8">

                    <div>
                      <h3 className="text-xl font-bold">
                        {comp.resume.originalName}
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        {new Date(comp.analyzedAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-5">
                      <div className="relative h-20 w-20">
                        <svg className="h-20 w-20 -rotate-90">
                          <circle
                            cx="40"
                            cy="40"
                            r="34"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r="34"
                            stroke={
                              comp.score >= 80
                                ? "#10b981"
                                : comp.score >= 60
                                ? "#f59e0b"
                                : "#ef4444"
                            }
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={214}
                            strokeDashoffset={
                              214 - (214 * comp.score) / 100
                            }
                            strokeLinecap="round"
                          />
                        </svg>

                        <div className="absolute inset-0 flex items-center justify-center font-bold">
                          {comp.score}%
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">Match Score</p>
                        <p className="text-lg font-semibold">
                          {comp.score >= 80
                            ? "Excellent"
                            : comp.score >= 60
                            ? "Good Match"
                            : "Needs Improvement"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="h-3 rounded-full bg-slate-200 overflow-hidden mb-8">
                    <div
                      className={`h-full ${scoreColor(comp.score)}`}
                      style={{ width: `${comp.score}%` }}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">

                    <div>
                      <h4 className="font-semibold text-emerald-600 mb-3">
                        Strengths
                      </h4>

                      <ul className="space-y-2 text-sm">
                        {comp.strengths.map((s, i) => (
                          <li key={i}>✅ {s}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-red-600 mb-3">
                        Missing Skills
                      </h4>

                      <ul className="space-y-2 text-sm">
                        {comp.missingSkills.map((s, i) => (
                          <li key={i}>❌ {s}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-blue-600 mb-3">
                        Suggestions
                      </h4>

                      <ul className="space-y-2 text-sm">
                        {comp.suggestions.map((s, i) => (
                          <li key={i}>💡 {s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default SingleJobPage;