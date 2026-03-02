import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

  const [job, setJob] = useState<Job | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedResumeIds, setSelectedResumeIds] = useState<string[]>([]);

  /* =========================
     Fetch Job
  ========================== */
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/api/jobs/${id}`);
        setJob(res.data);
      } catch {
        toast.error("Failed to load job");
      }
    };

    fetchJob();
  }, [id]);

  /* =========================
     Fetch Resumes
  ========================== */
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await api.get("/api/resumes");
        setResumes(res.data);
      } catch {
        toast.error("Failed to load resumes");
      }
    };

    fetchResumes();
  }, []);

  if (!job) return <p>Loading...</p>;

  /* =========================
     Multi Resume Analysis
  ========================== */
  const handleAnalyzeMultiple = async () => {
    if (!selectedResumeIds.length) {
      toast.error("Select at least one resume");
      return;
    }

    setAnalyzing(true);
    setLoading(true);
    try {
      // Analyze each selected resume one by one
      for (const resumeId of selectedResumeIds) {
        await api.post("/api/ai/analyze", {
          jobId: job._id,
          resumeId,
        });
      }

      // Fetch updated job with new comparisons
      const updatedJob = await api.get(`/api/jobs/${job._id}`);
      setJob(updatedJob.data);
      toast.success("Analysis complete for all selected resumes");
    } catch {
      toast.error("AI analysis failed");
    } finally {
      setAnalyzing(false);
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>{job.companyName}</h1>
      <p>Position: {job.role}</p>
      <p>Status: {job.status}</p>

      <hr />

      <h2>Attached Resume</h2>
      {job.resume ? (
        <a
          href={`http://localhost:5000/uploads/${job.resume.filename}`}
          target="_blank"
          rel="noreferrer"
        >
          {job.resume.originalName}
        </a>
      ) : (
        <p>No resume attached</p>
      )}

      <hr />

      <h3>Select Resume(s) to Analyze</h3>
      <select
        multiple
        value={selectedResumeIds}
        onChange={(e) => {
          const options = e.target.selectedOptions;
          const ids = Array.from(options).map((o) => o.value);
          setSelectedResumeIds(ids);
        }}
        disabled={loading || analyzing}
        style={{ minHeight: 120 }}
      >
        {resumes.map((r) => (
          <option key={r._id} value={r._id}>
            {r.originalName}
          </option>
        ))}
      </select>

      <br />
      <br />
      <button onClick={handleAnalyzeMultiple} disabled={analyzing}>
        {analyzing ? "Analyzing..." : "Analyze Selected Resumes"}
      </button>

      {analyzing && (
        <div style={{ marginTop: 10 }}>
          <div
            style={{
              width: "100%",
              height: 8,
              background: "#ddd",
              borderRadius: 4,
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "#4caf50",
                animation: "loading 1.5s infinite",
              }}
            />
          </div>
          <p>Analyzing resume(s) against job description...</p>
        </div>
      )}

      

      {(job.comparisons ?? []).length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h2>Resume Comparisons</h2>
          {[...(job.comparisons ?? [])]
            .sort((a: Comparison, b: Comparison) => b.score - a.score)
            .map((comp: Comparison, index: number) => (
              <div
                key={index}
                style={{
                  border: "1px solid #ddd",
                  padding: 20,
                  marginBottom: 20,
                  borderRadius: 8,
                }}
              >
                <h3>
                  {comp.resume.originalName} — {comp.score}%
                </h3>

                <h4>Strengths</h4>
                <ul>
                  {(comp.strengths || []).map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>

                <h4>Missing Skills</h4>
                <ul>
                  {(comp.missingSkills || []).map((m: string, i: number) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>

                <h4>Suggestions</h4>
                <ul>
                  {(comp.suggestions || []).map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>

                <p style={{ fontSize: 12, color: "#888" }}>
                  Analyzed on {new Date(comp.analyzedAt).toLocaleString()}
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default SingleJobPage;
