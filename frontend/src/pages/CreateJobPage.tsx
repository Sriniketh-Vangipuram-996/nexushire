import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";
import axios from "axios";
import { toast } from "react-toastify";

const CreateJobPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    companyName: "",
    role: "",
    description: "",
    status: "Applied",
    notes: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.companyName.trim() || !form.role.trim()) {
      setError("Company name and role are required.");
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/jobs", form);

      toast.success("Job application added successfully!");
      navigate("/dashboard");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Failed to create job");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const statusStyle = {
    Applied: "bg-blue-100 text-blue-700",
    Interviewed: "bg-amber-100 text-amber-700",
    Offer: "bg-emerald-100 text-emerald-700",
    Rejected: "bg-rose-100 text-rose-700",
  }[form.status];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="mb-4 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            ← Back to Dashboard
          </button>

          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Add Job Application
          </h1>

          <p className="mt-2 text-slate-500">
            Save a new opportunity and track it throughout your hiring journey.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Company Name
                </label>
                <input
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  placeholder="Google"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Role */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Job Role
                </label>
                <input
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  placeholder="Frontend Developer"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Status */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Status
                </label>

                <div className="flex flex-wrap gap-3">
                  {["Applied", "Interviewed", "Offer", "Rejected"].map(
                    (status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({ ...prev, status }))
                        }
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                          form.status === status
                            ? status === "Applied"
                              ? "bg-blue-600 text-white"
                              : status === "Interviewed"
                              ? "bg-amber-500 text-white"
                              : status === "Offer"
                              ? "bg-emerald-600 text-white"
                              : "bg-rose-600 text-white"
                            : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {status}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Job Description
                </label>
                <textarea
                  name="description"
                  rows={6}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Paste the job description here..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white resize-none"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Personal Notes
                </label>
                <textarea
                  name="notes"
                  rows={4}
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Referral, recruiter contact, interview prep..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white resize-none"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40">
                  {error}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Save Application"}
                </button>
              </div>
            </form>
          </div>

          {/* Preview Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 h-fit">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Live Preview
            </h3>

            <div className="mt-6 rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
              <div
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyle}`}
              >
                {form.status}
              </div>

              <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                {form.companyName || "Company Name"}
              </h2>

              <p className="mt-1 text-slate-500">
                {form.role || "Role"}
              </p>

              <div className="my-4 h-px bg-slate-200 dark:bg-slate-700" />

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Description
                </p>

                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-5">
                  {form.description || "No description added yet."}
                </p>
              </div>

              <div className="mt-5">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Notes
                </p>

                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-4">
                  {form.notes || "No notes added."}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-blue-50 p-4 dark:bg-blue-950/30">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Tip
              </p>
              <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                Add recruiter notes and the full job description to improve AI
                resume matching later.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateJobPage;