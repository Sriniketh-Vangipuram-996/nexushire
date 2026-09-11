import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import api from "../lib/axios";
import { toast } from "react-toastify";
import type { Resume } from "../types/resume";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ProfilePage = () => {
  const { user, setUser, updateUser } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    linkedin: "",
    github: "",
    leetcode: "",
  });

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  // ✅ Sync form whenever user data loads/changes
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        linkedin: user.linkedin || "",
        github: user.github || "",
        leetcode: user.leetcode || "",
      });
    }
  }, [user]);

  // Fetch resumes
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await api.get("/resume");
        setResumes(res.data);
      } catch {
        toast.error("Failed to fetch resumes");
      }
    };

    fetchResumes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
  try {
    setLoading(true);

    const res = await api.put("/user/profile", form);

    setUser(res.data.user);
    setForm({
      name: res.data.user.name || "",
      phone: res.data.user.phone || "",
      linkedin: res.data.user.linkedin || "",
      github: res.data.user.github || "",
      leetcode: res.data.user.leetcode || "",
    });

    toast.success("Profile updated successfully");
  } catch {
    toast.error("Update failed");
  } finally {
    setLoading(false);
  }
};



  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const res = await api.post("/user/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      updateUser({ avatar: res.data.avatar });
      toast.success("Avatar updated");

      setAvatarFile(null);
      setAvatarPreview(null);
    } catch {
      toast.error("Avatar upload failed");
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return;

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);

      const res = await api.post("/resume", formData);
      setResumes((prev) => [res.data, ...prev]);

      toast.success("Resume uploaded");
      setResumeFile(null);
    } catch {
      toast.error("Resume upload failed");
    }
  };

  const handleResumeDelete = async (id: string) => {
    const previous = [...resumes];
    setResumes((prev) => prev.filter((r) => r._id !== id));

    try {
      await api.delete(`/resume/${id}`);
      toast.success("Resume deleted");
    } catch {
      setResumes(previous);
      toast.error("Delete failed");
    }
  };

  const setDefaultResume = async (id: string) => {
    try {
      const res = await api.put(`/resume/${id}/default`);
      setResumes(res.data);
      toast.success("Default resume updated");
    } catch {
      toast.error("Failed to update default resume");
    }
  };

  // ✅ Uses current form values + avatar
  const calculateCompletion = () => {
    const fields = [
      form.name,
      form.phone,
      form.linkedin,
      form.github,
      form.leetcode,
      user?.avatar,
    ];

    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  };

  const completion = calculateCompletion();

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const avatarSrc =
  avatarPreview ||
  (user?.avatar ? `${API_URL}/uploads/${user.avatar}` : "/default-avatar.png");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <img
              src={avatarSrc}
              alt="avatar"
              className="w-28 h-28 rounded-full border-4 border-white object-cover"
            />

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold">
                {form.name || "Your Profile"}
              </h1>

              <p className="text-blue-100 mt-1">{user?.email}</p>

              <div className="mt-5">
                <div className="flex justify-between text-sm mb-2">
                  <span>Profile Completion</span>
                  <span>{completion}%</span>
                </div>

                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition"
            >
              {theme === "light" ? "🌙 Dark" : "☀️ Light"}
            </button>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
            Personal Information
          </h2>

          {/* Avatar Upload */}
<div className="mb-8">
  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
    Profile Photo
  </label>

  <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-6">
    <div className="flex flex-col md:flex-row items-center gap-6">
      <img
        src={
          avatarPreview
            ? avatarPreview
            : user?.avatar
            ? `http://localhost:5000/uploads/${user.avatar}`
            : "/default-avatar.png"
        }
        alt="avatar"
        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow"
      />

      <div className="flex-1 text-center md:text-left">
        <p className="font-semibold text-slate-900 dark:text-white">
          Upload a new profile picture
        </p>

        <p className="text-sm text-slate-500 mt-1">
          PNG or JPG • Max 5 MB
        </p>

        <div className="mt-4 flex flex-wrap gap-3 justify-center md:justify-start">
          <label className="cursor-pointer inline-flex items-center px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition font-medium">
            Choose File
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  const file = e.target.files[0];
                  setAvatarFile(file);
                  setAvatarPreview(URL.createObjectURL(file));
                }
              }}
            />
          </label>

          {avatarFile && (
            <button
              onClick={handleAvatarUpload}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
            >
              Upload
            </button>
          )}
        </div>

        {avatarFile && (
          <p className="text-xs text-slate-500 mt-3">
            Selected: {avatarFile.name}
          </p>
        )}
      </div>
    </div>
  </div>
</div>

          {/* Form */}
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Full Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-xl border px-4 py-3 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-xl border px-4 py-3 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                LinkedIn
              </label>
              <input
                name="linkedin"
                value={form.linkedin}
                onChange={handleChange}
                className="w-full rounded-xl border px-4 py-3 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">GitHub</label>
              <input
                name="github"
                value={form.github}
                onChange={handleChange}
                className="w-full rounded-xl border px-4 py-3 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">
                LeetCode
              </label>
              <input
                name="leetcode"
                value={form.leetcode}
                onChange={handleChange}
                className="w-full rounded-xl border px-4 py-3 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={loading}
            className="mt-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-3 rounded-xl font-medium"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Resume Manager */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Resume Manager</h2>
            <span className="text-sm text-slate-500">
              {resumes.length} Resume{resumes.length !== 1 ? "s" : ""}
            </span>
          </div>

          {resumes.length === 0 ? (
            <div className="border-2 border-dashed rounded-2xl p-10 text-center text-slate-500">
              📄 No resumes uploaded yet
            </div>
          ) : (
            <div className="space-y-4">
              {resumes.map((resume) => (
                <div
                  key={resume._id}
                  className="flex flex-col md:flex-row md:items-center justify-between rounded-2xl border p-5"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">
                        {resume.originalName}
                      </p>

                      {resume.isDefault && (
                        <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                          Default
                        </span>
                      )}
                    </div>

                    <a
                      href={`http://localhost:5000/uploads/${resume.filename}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 text-sm hover:underline"
                    >
                      View Resume
                    </a>
                  </div>

                  <div className="flex gap-3 mt-4 md:mt-0">
                    {!resume.isDefault && (
                      <button
                        onClick={() => setDefaultResume(resume._id)}
                        className="px-4 py-2 rounded-xl border hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Set Default
                      </button>
                    )}

                    <button
                      onClick={() => handleResumeDelete(resume._id)}
                      className="px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload Resume */}
          <div className="mt-8 border-t pt-6">
            <label className="block text-sm font-medium mb-2">
              Upload New Resume
            </label>

            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="block w-full text-sm"
              onChange={(e) => {
                if (e.target.files?.length) {
                  setResumeFile(e.target.files[0]);
                }
              }}
            />

            {resumeFile && (
              <button
                onClick={handleResumeUpload}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium"
              >
                Upload Resume
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;