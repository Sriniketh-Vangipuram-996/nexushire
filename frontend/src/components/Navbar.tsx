import { useState, useEffect } from "react";
import api from "../lib/axios";
import { useThemeStore } from "../store/themeStore";
import { useNavigate } from "react-router-dom";

interface Props {
  toggleSidebar: () => void;
}

interface Notification {
  _id: string;
  message: string;
  isRead: boolean;
}

export default function Navbar({ toggleSidebar }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [openProfile, setOpenProfile] = useState(false);

  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications");
        setNotifications(res.data ?? []);
      } catch {
        setNotifications([]);
      }
    };

    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 dark:border-slate-800 dark:bg-slate-900">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 hover:bg-slate-100 md:hidden dark:hover:bg-slate-800"
        >
          ☰
        </button>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Dashboard
          </h2>
          <p className="hidden text-xs text-slate-500 sm:block">
            Welcome back
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button
          onClick={() =>
            setTheme(theme === "dark" ? "light" : "dark")
          }
          className="rounded-xl border border-slate-200 p-2 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        <button
          onClick={() => navigate("/notifications")}
          className="relative rounded-xl border border-slate-200 p-2 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          🔔
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setOpenProfile(!openProfile)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white"
          >
            U
          </button>

          {openProfile && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 bg-white py-2 dark:border-slate-700 dark:bg-slate-900">
              <button
                onClick={() => navigate("/profile")}
                className="block w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                👤 Profile
              </button>

              <button
                onClick={() => navigate("/login")}
                className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}