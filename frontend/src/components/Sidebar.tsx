import { Link, useLocation } from "react-router-dom";
import { useNotificationStore } from "../store/notificationStore";

interface Props {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}
// Preload functions
const preloadDashboardPage = () => import("../pages/DashboardPage");
const preloadAnalyticsPage = () => import("../pages/DashboardAnalytics");
const preloadRemindersPage = () => import("../pages/RemindersPage");

export default function Sidebar({ isOpen, setIsOpen }: Props) {
  const location = useLocation();
  const {unreadCount}=useNotificationStore();
  const linkClass = (path: string) =>
    `block px-4 py-2 rounded-xl transition ${
      location.pathname === path
        ? "bg-blue-600 text-white"
        : "text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
    }`;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed md:static z-40 bg-white dark:bg-gray-900 shadow-lg
        h-full w-64 p-6 transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <h2 className="text-xl font-bold mb-6 dark:text-white">
          NEXUSHIRE
        </h2>

        <nav className="space-y-3">
          <Link
  to="/dashboard"
  className={linkClass("/dashboard")}
  onMouseEnter={preloadDashboardPage} // ← preload on hover
>
  🏠 Dashboard
</Link>

<Link
  to="/reminders"
  className={linkClass("/reminders")}
  onMouseEnter={preloadRemindersPage} // ← preload on hover
>
  📅 Reminders
</Link>

<Link
  to="/notifications"
  className={linkClass("/notifications")}
>
  <div className="relative">
    🔔 Notifications
    {unreadCount > 0 && (
      <span className="absolute-top-2-right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
        {unreadCount}
      </span>
    )}
  </div>
</Link>

<Link
  to="/analytics"
  className={linkClass("/analytics")}
  onMouseEnter={preloadAnalyticsPage} // ← preload on hover
>
  📊 Analytics
</Link>
        </nav>
      </div>
    </>
  );
}