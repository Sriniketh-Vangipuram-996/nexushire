import { useEffect, useState, lazy, Suspense } from "react";
import api from "../lib/axios";
import axios from "axios";
import { toast } from "react-toastify";
import KpiCard from "../components/KpiCard";

const AdminCharts = lazy(() => import("../components/AdminCharts"));

interface Job {
  _id: string;
  companyName: string;
  role: string;
  status: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  jobs: Job[];
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalJobs: number;
  totalEvents: number;
  eventBreakdown: { _id: string; count: number }[];
}

interface FailedReminder {
  _id: string;
  failureReason: string;
  retryCount: number;
  failedAt: string;
  user: {
    name: string;
    email: string;
  };
  job: {
    companyName: string;
    role: string;
  };
}

interface ReminderStats {
  total: number;
  sent: number;
  failed: number;
  totalRetries: number;
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);

  const [failedReminders, setFailedReminders] = useState<FailedReminder[]>([]);
  const [reminderStats, setReminderStats] =
    useState<ReminderStats | null>(null);

  const fetchUsers = async (query = search) => {
    try {
      setLoadingUsers(true);

      const res = await api.get(`/admin/users?search=${query}`);
      setUsers(res.data.users);
    } catch (err) {
      if (axios.isAxiosError(err))
        toast.error("Failed to fetch users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchStats = async () => {
    const res = await api.get("/admin/stats");
    setStats(res.data);
  };

  const fetchReminderMonitoring = async () => {
    const failed = await api.get("/admin/reminders/failed");
    const health = await api.get("/admin/reminders/health");

    setFailedReminders(failed.data);
    setReminderStats(health.data);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([
          fetchUsers(),
          fetchStats(),
          fetchReminderMonitoring(),
        ]);
      } catch {
        toast.error("Failed to load dashboard");
      } finally {
        setLoadingPage(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const toggleUser = async (id: string) => {
    try {
      await api.patch(`/admin/users/${id}/toggle`);
      fetchUsers();
      toast.success("Status updated");
    } catch {
      toast.error("Failed");
    }
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const retryReminder = async (id: string) => {
    try {
      await api.post(`/admin/reminders/${id}/retry`);
      fetchReminderMonitoring();
      toast.success("Retry scheduled");
    } catch {
      toast.error("Retry failed");
    }
  };

  const bulkToggle = async () => {
    await Promise.all(
      selectedUsers.map((id) =>
        api.patch(`/admin/users/${id}/toggle`)
      )
    );

    setSelectedUsers([]);
    fetchUsers();
  };

  const bulkDelete = async () => {
    if (!window.confirm("Delete selected users?")) return;

    await Promise.all(
      selectedUsers.map((id) =>
        api.delete(`/admin/users/${id}`)
      )
    );

    setSelectedUsers([]);
    fetchUsers();
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loadingPage || !stats) {
    return (
      <div className="flex h-[70vh] items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-slate-500">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-slate-500">
            Manage users, monitor activity and email reminders.
          </p>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <KpiCard
            title="Users"
            value={stats.totalUsers}
            color="bg-blue-600"
          />
          <KpiCard
            title="Active"
            value={stats.activeUsers}
            color="bg-emerald-600"
          />
          <KpiCard
            title="Jobs"
            value={stats.totalJobs}
            color="bg-violet-600"
          />
          <KpiCard
            title="Events"
            value={stats.totalEvents}
            color="bg-amber-500"
          />
        </div>

        {/* Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <Suspense fallback={<p>Loading chart...</p>}>
            <AdminCharts
              eventBreakdown={stats.eventBreakdown}
            />
          </Suspense>
        </div>

        {/* Reminder Health */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Reminder Health
            </h2>
          </div>

          {reminderStats && (
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <KpiCard
                title="Total"
                value={reminderStats.total}
                color="bg-indigo-600"
              />
              <KpiCard
                title="Sent"
                value={reminderStats.sent}
                color="bg-green-600"
              />
              <KpiCard
                title="Failed"
                value={reminderStats.failed}
                color="bg-red-600"
              />
              <KpiCard
                title="Retries"
                value={reminderStats.totalRetries}
                color="bg-yellow-500"
              />
            </div>
          )}

          {/* Mobile Cards */}
          <div className="space-y-4 lg:hidden">
            {failedReminders.map((r) => (
              <div
                key={r._id}
                className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
              >
                <div className="font-semibold">{r.user.name}</div>
                <div className="text-sm text-slate-500">
                  {r.user.email}
                </div>

                <div className="mt-3">
                  <div className="font-medium">
                    {r.job.companyName}
                  </div>
                  <div className="text-sm text-slate-500">
                    {r.job.role}
                  </div>
                </div>

                <div className="mt-3 text-red-600 text-sm">
                  {r.failureReason}
                </div>

                <button
                  onClick={() => retryReminder(r._id)}
                  className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-white"
                >
                  Retry
                </button>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-3">User</th>
                  <th>Job</th>
                  <th>Reason</th>
                  <th className="text-center">Retries</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {failedReminders.map((r) => (
                  <tr
                    key={r._id}
                    className="border-b dark:border-slate-800"
                  >
                    <td className="py-4">
                      <div className="font-medium">
                        {r.user.name}
                      </div>
                      <div className="text-sm text-slate-500">
                        {r.user.email}
                      </div>
                    </td>

                    <td>
                      {r.job.companyName}
                      <div className="text-sm text-slate-500">
                        {r.job.role}
                      </div>
                    </td>

                    <td className="text-red-600">
                      {r.failureReason}
                    </td>

                    <td className="text-center">
                      {r.retryCount}
                    </td>

                    <td className="text-center">
                      <button
                        onClick={() =>
                          retryReminder(r._id)
                        }
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white"
                      >
                        Retry
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              User Management
            </h2>

            {selectedUsers.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={bulkToggle}
                  className="rounded-lg bg-amber-500 px-4 py-2 text-white"
                >
                  Toggle
                </button>

                <button
                  onClick={bulkDelete}
                  className="rounded-lg bg-red-600 px-4 py-2 text-white"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email..."
            className="mb-5 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />

          {/* Mobile */}
          <div className="space-y-4 lg:hidden">
            {filteredUsers.map((u) => (
              <div
                key={u._id}
                className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">
                      {u.name}
                    </div>
                    <div className="text-sm text-slate-500">
                      {u.email}
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(u._id)}
                    onChange={() =>
                      setSelectedUsers((prev) =>
                        prev.includes(u._id)
                          ? prev.filter(
                              (id) => id !== u._id
                            )
                          : [...prev, u._id]
                      )
                    }
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <span>{u.role}</span>
                  <span
                    className={`rounded-full px-2 py-1 ${
                      u.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {u.isActive
                      ? "Active"
                      : "Suspended"}
                  </span>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => toggleUser(u._id)}
                    className="flex-1 rounded-lg border py-2"
                  >
                    Toggle
                  </button>

                  <button
                    onClick={() => deleteUser(u._id)}
                    className="flex-1 rounded-lg bg-red-600 py-2 text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-3">
                    <input
                      type="checkbox"
                      checked={
                        selectedUsers.length === users.length
                      }
                      onChange={() =>
                        setSelectedUsers(
                          selectedUsers.length ===
                            users.length
                            ? []
                            : users.map((u) => u._id)
                        )
                      }
                    />
                  </th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Jobs</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((u) => (
                  <tr
                    key={u._id}
                    className="border-b dark:border-slate-800"
                  >
                    <td className="py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(
                          u._id
                        )}
                        onChange={() =>
                          setSelectedUsers((prev) =>
                            prev.includes(u._id)
                              ? prev.filter(
                                  (id) => id !== u._id
                                )
                              : [...prev, u._id]
                          )
                        }
                      />
                    </td>

                    <td>
                      <div className="font-medium">
                        {u.name}
                      </div>
                      <div className="text-sm text-slate-500">
                        {u.email}
                      </div>
                    </td>

                    <td>{u.role}</td>

                    <td>
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          u.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {u.isActive
                          ? "Active"
                          : "Suspended"}
                      </span>
                    </td>

                    <td>{u.jobs.length}</td>

                    <td>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            toggleUser(u._id)
                          }
                          className="rounded-lg border px-3 py-2"
                        >
                          Toggle
                        </button>

                        <button
                          onClick={() =>
                            deleteUser(u._id)
                          }
                          className="rounded-lg bg-red-600 px-3 py-2 text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {loadingUsers && (
              <div className="py-4 text-center text-slate-500">
                Updating...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;