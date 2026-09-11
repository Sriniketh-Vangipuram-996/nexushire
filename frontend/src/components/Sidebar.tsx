import { Link, useLocation } from "react-router-dom";
import { useNotificationStore } from "../store/notificationStore";

interface Props {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

const preloadDashboardPage = () => import("../pages/DashboardPage");
const preloadAnalyticsPage = () => import("../pages/DashboardAnalytics");
const preloadRemindersPage = () => import("../pages/RemindersPage");

export default function Sidebar({ isOpen, setIsOpen }: Props) {
  const location = useLocation();
  const { unreadCount } = useNotificationStore();

  const linkClass = (path: string) =>
    `flex items-center justify-between rounded-xl px-4 py-3 transition ${
      location.pathname === path
        ? "bg-blue-600 text-white"
        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
    }`;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 border-r border-slate-200 bg-white transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900 ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex h-full flex-col p-6">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              <span className="text-blue-600">Nexus</span>Hire
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Job Tracker
            </p>
          </div>

          {/* Menu */}
          <nav className="space-y-2">
            <Link
              to="/dashboard"
              className={linkClass("/dashboard")}
              onMouseEnter={preloadDashboardPage}
              onClick={() => setIsOpen(false)}
            >
              <span>🏠 Dashboard</span>
            </Link>

            <Link
              to="/analytics"
              className={linkClass("/analytics")}
              onMouseEnter={preloadAnalyticsPage}
              onClick={() => setIsOpen(false)}
            >
              <span>📊 Analytics</span>
            </Link>

            <Link
              to="/reminders"
              className={linkClass("/reminders")}
              onMouseEnter={preloadRemindersPage}
              onClick={() => setIsOpen(false)}
            >
              <span>📅 Reminders</span>
            </Link>

            <Link
              to="/notifications"
              className={linkClass("/notifications")}
              onClick={() => setIsOpen(false)}
            >
              <div className="flex w-full items-center justify-between">
                <span>🔔 Notifications</span>

                {unreadCount > 0 && (
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </div>
            </Link>
          </nav>

          {/* Bottom */}
          <div className="mt-auto border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-800">
            NexusHire v1.0
          </div>
        </div>
      </aside>
    </>
  );
}