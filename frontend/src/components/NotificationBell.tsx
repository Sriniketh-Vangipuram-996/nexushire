import { useEffect, useState } from "react";
import api from "../lib/axios";
import { useNavigate } from "react-router-dom";

interface Notification {
  _id: string;
  message: string;
  read: boolean;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const navigate=useNavigate();

  const fetchNotifications = async () => {
    const res = await api.get("/notifications");
    setNotifications(res.data);
  };

  const markRead = async (id: string) => {
  await api.patch(`/notifications/${id}/read`);

  setNotifications((prev) =>
    prev.map((n) =>
      n._id === id ? { ...n, read: true } : n
    )
  );
};

  useEffect(() => {
    const loadData=async()=>
      fetchNotifications();

    loadData();
  }, []);

  return (
    <div className="relative">
      <button onClick={() => {
        setOpen(!open);
        navigate("/notifications");
        }}>
        🔔
      </button>

      {notifications.some((n) => !n.read) && (
        <span className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full"></span>
      )}

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl rounded-2xl p-4">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={()=>markRead(n._id)}
              className={`border-b py-2 text-sm cursor-pointer ${n.read? "text-gray-400 ":"font-semibold"}`}
            >
              {n.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
