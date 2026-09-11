import { useEffect, useState } from "react";
import { getReminders } from "../services/reminderService";
import ReminderCard from "../components/ReminderCard";
import type { Reminder } from "../types/reminder";

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const res = await getReminders();
      setReminders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const scheduled = reminders.filter((r) => r.status === "scheduled").length;
  const sent = reminders.filter((r) => r.status === "sent").length;
  const cancelled = reminders.filter((r) => r.status === "cancelled").length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-8 text-white">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-cyan-300/10 blur-2xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">
                Reminder Center
              </p>

              <h1 className="mt-2 text-4xl font-bold">
                Never miss a follow-up
              </h1>

              <p className="mt-3 max-w-2xl text-blue-100">
                Schedule interview reminders, follow-up emails and important
                application deadlines from one place.
              </p>
            </div>

            <div className="rounded-2xl bg-white/15 backdrop-blur px-6 py-5 text-center min-w-[140px]">
              <p className="text-3xl font-bold">{reminders.length}</p>
              <p className="text-sm text-blue-100">Total Reminders</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Total</span>
              <span className="text-xl">📅</span>
            </div>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
              {reminders.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Scheduled</span>
              <span className="text-xl">⏰</span>
            </div>
            <h2 className="mt-3 text-3xl font-bold text-blue-600">
              {scheduled}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Completed</span>
              <span className="text-xl">✅</span>
            </div>
            <h2 className="mt-3 text-3xl font-bold text-emerald-600">
              {sent}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Cancelled</span>
              <span className="text-xl">❌</span>
            </div>
            <h2 className="mt-3 text-3xl font-bold text-red-600">
              {cancelled}
            </h2>
          </div>
        </div>

        {/* Reminder List */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Your Reminders
              </h2>
              <p className="text-sm text-slate-500">
                Upcoming interviews and follow-up schedule
              </p>
            </div>

            <button
              onClick={fetchReminders}
              className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <p className="mt-4 text-slate-500">
                Loading reminders...
              </p>
            </div>
          ) : reminders.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 py-20 text-center">
              <div className="mb-4 text-6xl">📆</div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                No reminders yet
              </h3>

              <p className="mx-auto mt-3 max-w-md text-slate-500">
                Create reminders from your job applications so you never miss an
                interview or recruiter follow-up.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {reminders.map((reminder) => (
                <ReminderCard
                  key={reminder._id}
                  reminder={reminder}
                  onCancel={fetchReminders}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}