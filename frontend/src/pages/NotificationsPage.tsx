import { useEffect, useState } from "react";
import api from "../lib/axios";
import { useNotificationStore } from "../store/notificationStore";

interface Notification {
  _id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const resetUnreadCount = useNotificationStore((s) => s.resetUnreadCount);
const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);

  useEffect(() => {
    const loadData = async () => {
      try {
        await api.patch("/notifications/mark-all-read");

        const res = await api.get("/notifications");
        setNotifications(res.data);

        resetUnreadCount();

        // Sync Zustand with backend
        await fetchUnreadCount();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [resetUnreadCount,fetchUnreadCount]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-slate-500">Loading notifications...</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-8 text-white">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">
                Activity Center
              </p>

              <h1 className="mt-2 text-4xl font-bold">Notifications</h1>

              <p className="mt-2 text-blue-100">
                Stay updated with reminders, application changes and AI insights.
              </p>
            </div>

            <div className="rounded-2xl bg-white/15 backdrop-blur px-6 py-4 text-center min-w-[120px]">
              <p className="text-3xl font-bold">{notifications.length}</p>
              <p className="text-sm text-blue-100">Total</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
            <p className="text-sm text-slate-500">Total</p>
            <h3 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
              {notifications.length}
            </h3>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
            <p className="text-sm text-slate-500">Unread</p>
            <h3 className="mt-1 text-3xl font-bold text-blue-600">
              {unreadCount}
            </h3>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
            <p className="text-sm text-slate-500">Read</p>
            <h3 className="mt-1 text-3xl font-bold text-emerald-600">
              {notifications.length - unreadCount}
            </h3>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
            <p className="text-sm text-slate-500">Latest</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {notifications.length > 0
                ? new Date(notifications[0].createdAt).toLocaleDateString()
                : "--"}
            </h3>
          </div>
        </div>

        {/* Notification List */}
        {notifications.length === 0 ? (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-14 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-4xl">
              🔔
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              You're all caught up
            </h2>

            <p className="mt-2 text-slate-500">
              New reminders and activity will appear here.
            </p>
          </div>
        ) : (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Recent Activity
              </h2>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className="flex items-start gap-4 px-6 py-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                >
                  {/* Icon */}
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl ${
                      n.isRead
                        ? "bg-slate-100 dark:bg-slate-800"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    🔔
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {!n.isRead && (
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                      )}

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          n.isRead
                            ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {n.isRead ? "Read" : "New"}
                      </span>
                    </div>

                    <p className="mt-2 text-slate-900 dark:text-slate-100 leading-relaxed">
                      {n.message}
                    </p>

                    <p className="mt-3 text-sm text-slate-500">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;