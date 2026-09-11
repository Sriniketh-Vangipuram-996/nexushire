import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { BriefcaseBusiness } from "lucide-react";

const GuestOnly = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-xl p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/30">
              <BriefcaseBusiness className="h-8 w-8 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              NexusHire
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Preparing your workspace...
            </p>

            <div className="mt-6 w-full">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-blue-600" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
              <div className="h-2 w-2 animate-ping rounded-full bg-blue-600" />
              Checking authentication
            </div>
          </div>
        </div>
      </div>
    );

  if (user) return <Navigate to="/dashboard" replace />;

  return children;
};

export default GuestOnly;