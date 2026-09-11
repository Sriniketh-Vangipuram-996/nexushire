import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import api from "../lib/axios";

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const hasLength = password.length >= 6;
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const strength = hasLength && hasSpecial ? 100 : hasLength ? 60 : password ? 30 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!hasLength || !hasSpecial) {
      setError(
        "Password must be at least 6 characters and contain one special character."
      );
      return;
    }

    try {
      setIsLoading(true);

      await api.post(
        "/auth/signup",
        {
          email,
          password,
        },
        { withCredentials: true }
      );

      toast.success("Account created successfully!");

      setSuccess(
        "Your account has been created. Please check your email to verify your account."
      );

      setEmail("");
      setPassword("");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Something went wrong.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50 dark:bg-slate-950">
      {/* Left Branding */}
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-12 text-white">
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-xl font-bold">
                N
              </div>
              <h1 className="text-2xl font-bold">NexusHire</h1>
            </div>

            <div className="mt-16">
              <span className="rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur">
                AI-Powered Career Platform
              </span>

              <h2 className="mt-6 text-5xl font-bold leading-tight">
                Start tracking smarter.
              </h2>

              <p className="mt-5 max-w-md text-blue-100 text-lg leading-relaxed">
                Organize applications, schedule reminders, analyze resumes with AI,
                and land your next opportunity—all in one beautiful workspace.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              ["100%", "Free"],
              ["AI", "Resume Match"],
              ["24/7", "Reminders"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-2xl bg-white/10 backdrop-blur p-4"
              >
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-blue-100">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 text-center lg:hidden">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
                N
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                NexusHire
              </span>
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                Create Account
              </h2>
              <p className="mt-2 text-slate-500">
                Join NexusHire and start tracking your career journey.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email Address
                </label>

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 pr-12 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>

                {/* Strength Bar */}
                <div className="mt-3">
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        strength === 100
                          ? "bg-emerald-500"
                          : strength >= 60
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${strength}%` }}
                    />
                  </div>

                  <div className="mt-2 space-y-1 text-xs">
                    <div
                      className={`flex items-center gap-2 ${
                        hasLength ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      <span>{hasLength ? "✓" : "○"}</span>
                      At least 6 characters
                    </div>

                    <div
                      className={`flex items-center gap-2 ${
                        hasSpecial ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      <span>{hasSpecial ? "✓" : "○"}</span>
                      Contains a special character
                    </div>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {success}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              <span className="px-3 text-xs text-slate-400">OR</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            </div>

            {/* Login */}
            <p className="text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Sign In
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Secure authentication • Email verification enabled
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;