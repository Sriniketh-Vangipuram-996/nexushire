import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;