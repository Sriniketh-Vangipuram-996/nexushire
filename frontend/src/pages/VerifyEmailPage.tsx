
import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Mail,
  ArrowRight,
} from "lucide-react";
import api from "../lib/axios";

// Capture and remove the token before React renders.
// Email verification links should open this page as a fresh page load.
const initialVerificationToken = (() => {
  const url = new URL(window.location.href);
  const token = url.searchParams.get("token");

  if (token) {
    url.searchParams.delete("token");

    window.history.replaceState(
      window.history.state,
      document.title,
      `${url.pathname}${url.search}${url.hash}`
    );
  }

  return token;
})();

type VerificationState = "loading" | "success" | "error";

const VerifyEmailPage = () => {
  const navigate = useNavigate();

  const [status, setStatus] = useState(
    "Verifying your email..."
  );
  const [state, setState] =
    useState<VerificationState>("loading");

  // Prevent duplicate verification requests in React Strict Mode.
  const verificationStarted = useRef(false);

  useEffect(() => {
    if (verificationStarted.current) return;

    verificationStarted.current = true;

    const verifyEmail = async () => {
      if (!initialVerificationToken) {
        setState("error");
        setStatus(
          "The verification link is missing its token. Please request a new verification email."
        );
        return;
      }

      try {
        await api.post("/auth/verify-email", {
          token: initialVerificationToken,
        });

        setState("success");
        setStatus(
          "Your email has been verified successfully. You can now log in to NexusHire."
        );
      } catch (err: unknown) {
        let message =
          "We could not verify your email. The link may have expired or already been used.";

        if (axios.isAxiosError(err)) {
          const serverMessage = err.response?.data?.error;

          if (typeof serverMessage === "string") {
            message = serverMessage;
          }
        }

        setState("error");
        setStatus(message);
      }
    };

    void verifyEmail();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-violet-200/30 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="h-11 w-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
              N
            </div>

            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              NexusHire
            </span>
          </Link>
        </div>

        {/* Verification Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
          {/* Status Icon */}
          <div
            className={`mx-auto h-24 w-24 rounded-full flex items-center justify-center mb-6 ${
              state === "loading"
                ? "bg-blue-100 dark:bg-blue-900/30"
                : state === "success"
                ? "bg-emerald-100 dark:bg-emerald-900/30"
                : "bg-red-100 dark:bg-red-900/30"
            }`}
          >
            {state === "loading" && (
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            )}

            {state === "success" && (
              <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            )}

            {state === "error" && (
              <XCircle className="h-12 w-12 text-red-600" />
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {state === "loading" && "Verifying Email"}
            {state === "success" && "Verification Complete"}
            {state === "error" && "Verification Failed"}
          </h1>

          <p className="mt-3 text-slate-500 leading-relaxed">
            {status}
          </p>

          {/* Loading */}
          {state === "loading" && (
            <div className="mt-8 space-y-4">
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full w-1/2 bg-blue-600 rounded-full animate-pulse" />
              </div>

              <p className="text-sm text-slate-500">
                Please wait while we securely verify your account.
              </p>
            </div>
          )}

          {/* Success */}
          {state === "success" && (
            <div className="mt-8">
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 mb-5">
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  Your account is ready. Sign in to continue.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/login?verified=true")}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
              >
                Continue to Login
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* Error */}
          {state === "error" && (
            <div className="mt-8 space-y-3">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-semibold transition"
              >
                Go to Login
              </button>

              <Link
                to="/signup"
                className="block w-full border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 py-3 rounded-xl font-medium transition"
              >
                Create New Account
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
          <Mail size={16} />
          <span>Secure email verification • NexusHire</span>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
