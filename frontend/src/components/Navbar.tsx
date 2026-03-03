import { useState, useEffect } from "react";
import api from "../lib/axios";
import { useThemeStore } from "../store/themeStore";
import { useNavigate } from "react-router-dom";

interface Props {
  toggleSidebar: () => void;
}
interface Notification{
  id:string;
  read:boolean;
  message:string;
}
export default function Navbar({ toggleSidebar }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [openProfile, setOpenProfile] = useState(false);
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    const res = await api.get("/notifications");
    setNotifications(res.data);
  };

  useEffect(() => {
    const loadData=async()=>{
      fetchNotifications();
    }
    loadData();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white dark:bg-gray-900 shadow">
      {/* Left */}
      <button
        onClick={toggleSidebar}
        className="md:hidden text-xl"
      >
        ☰
      </button>

      {/* Right */}
      <div className="flex items-center gap-6">

        {/* Dark Mode Toggle */}
        <button
          onClick={() =>
            setTheme(theme === "dark" ? "light" : "dark")
          }
        >
          {theme === "dark" ? "🌞" : "🌙"}
        </button>

        {/* Notifications */}
        <div
          className="relative cursor-pointer"
          onClick={() => navigate("/notifications")}
        >
          🔔
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpenProfile(!openProfile)}
            className="rounded-full bg-gray-200 w-8 h-8"
          />

          {openProfile && (
            <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 shadow-xl rounded-xl w-40">
              <button
                onClick={() => navigate("/profile")}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Profile
              </button>
              <button
                onClick={() => navigate("/login")}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}