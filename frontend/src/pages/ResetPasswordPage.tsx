import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../lib/axios";
import { toast } from "react-toastify";

const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token"); // token from URL

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Invalid or missing token.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/api/auth/reset-password", {
        token,
        newPassword: password,
      });

      toast.success("Password updated successfully. Please login.");
      navigate("/login");
    } catch{
      setError(
         "Invalid or expired token. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Reset Password</h1>

      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
      />

      <input
        type="password"
        placeholder="Confirm new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        autoComplete="new-password"
      />

      <button type="submit" disabled={loading}>
        {loading ? "Updating..." : "Update Password"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
};

export default ResetPasswordPage;
