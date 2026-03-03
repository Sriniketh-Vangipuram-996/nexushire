import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import api from "../lib/axios";
import { toast } from "react-toastify";
import type { Resume } from "../types/resume";

const ProfilePage = () => {
  const { user, setUser, updateUser } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    linkedin: user?.linkedin || "",
    github: user?.github || "",
    leetcode: user?.leetcode || "",
  });

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  /* ================================
      FETCH RESUMES
  ================================= */
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await api.get("/resumes");
        setResumes(res.data);
      } catch {
        toast.error("Failed to fetch resumes");
      }
    };

    fetchResumes();
  }, []);

  /* ================================
      PROFILE INPUT CHANGE
  ================================= */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================================
      SAVE PROFILE INFO
  ================================= */
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const res = await api.put("/user/profile", form);
      setUser(res.data.user);
      toast.success("Profile updated");
    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================================
      AVATAR UPLOAD
  ================================= */
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
    } catch {
      toast.error("Avatar upload failed");
    }
  };

  /* ================================
      RESUME UPLOAD
  ================================= */
  const handleResumeUpload = async () => {
    if (!resumeFile) return;

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);

      const res = await api.post("/resumes", formData);
      setResumes((prev) => [res.data, ...prev]);

      toast.success("Resume uploaded");
      setResumeFile(null);
    } catch {
      toast.error("Resume upload failed");
    }
  };

  /* ================================
      DELETE RESUME
  ================================= */
  const handleResumeDelete = async (id: string) => {
    const previousResumes=[...resumes];
    setResumes((prev) => prev.filter((r) => r._id !== id));
    try {
      await api.delete(`/resumes/${id}`);
      toast.success("Resume deleted");
    } catch {
      setResumes(previousResumes);
      toast.error("Delete failed");
    }
  };

  /* ================================
      SET DEFAULT RESUME
  ================================= */
  const setDefaultResume = async (id: string) => {
    try {
      const res = await api.put(`/resumes/${id}/default`);
      setResumes(res.data);
      toast.success("Default resume updated");
    } catch {
      toast.error("Failed to update default resume");
    }
  };

  /* ================================
      PROFILE COMPLETION
  ================================= */
  const calculateCompletion = () => {
    if (!user) return 0;

    const fields = [
      user.name,
      user.phone,
      user.linkedin,
      user.github,
      user.leetcode,
      user.avatar,
    ];

    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  const completion = calculateCompletion();

  /* ================================
      CLEANUP PREVIEW
  ================================= */
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  return (
    <div style={{ padding: 30, maxWidth: 800, margin: "0 auto" }}>
      <h1>Profile</h1>

      <button onClick={toggleTheme}>
        Switch to {theme === "light" ? "Dark" : "Light"} Mode
      </button>

      <hr />

      {/* ================================
            PROFILE INFO SECTION
      ================================= */}
      <h2>Profile Information</h2>

      {/* AVATAR */}
      <div>
        <img
          src={
            avatarPreview
              ? avatarPreview
              : user?.avatar
              ? `http://localhost:5000/uploads/${user.avatar}`
              : "/default-avatar.png"
          }
          alt="avatar"
          width={120}
          style={{ borderRadius: "50%" }}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files) {
              const file = e.target.files[0];
              setAvatarFile(file);
              setAvatarPreview(URL.createObjectURL(file));
            }
          }}
        />

        <button onClick={handleAvatarUpload}>
          Upload Avatar
        </button>
      </div>

      <br />

      {/* PERSONAL INFO */}
      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
      <br />
      <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
      <br />
      <input name="linkedin" placeholder="LinkedIn URL" value={form.linkedin} onChange={handleChange} />
      <br />
      <input name="github" placeholder="GitHub URL" value={form.github} onChange={handleChange} />
      <br />
      <input name="leetcode" placeholder="LeetCode URL" value={form.leetcode} onChange={handleChange} />
      <br />

      <button onClick={handleSaveProfile} disabled={loading}>
        {loading ? "Saving..." : "Save Profile"}
      </button>

      <hr />

      {/* ================================
            RESUME SECTION (INSIDE PROFILE)
      ================================= */}
      <h3>Resumes</h3>

      {resumes.length === 0 ? (
        <p>No resumes uploaded</p>
      ) : (
        resumes.map((resume) => (
          <div key={resume._id} style={{ marginBottom: 10 }}>
            <a
              href={`http://localhost:5000/uploads/${resume.filename}`}
              target="_blank"
              rel="noreferrer"
            >
              {resume.originalName}
            </a>

            {resume.isDefault && <strong> (Default)</strong>}

            <div>
              <button onClick={() => setDefaultResume(resume._id)}>
                Make Default
              </button>

              <button onClick={() => handleResumeDelete(resume._id)}>
                Delete
              </button>
            </div>
          </div>
        ))
      )}

      <input
        type="file"
        accept=".pdf,.docx"
        onChange={(e) => {
          if (e.target.files) setResumeFile(e.target.files[0]);
        }}
      />

      <button onClick={handleResumeUpload}>
        Upload Resume
      </button>

      <hr />

      {/* PROFILE COMPLETION */}
      <h3>Profile Completion</h3>

      <div
        style={{
          background: theme === "dark" ? "#333" : "#ddd",
          height: 12,
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${completion}%`,
            background: "green",
            height: "100%",
          }}
        />
      </div>

      <p>{completion}% completed</p>
    </div>
  );
};

export default ProfilePage;
