import { useEffect, useState } from "react";
import api from "../lib/axios";
import KpiCard from "../components/KpiCard";
import axios from "axios";
import { lazy,Suspense } from "react";
import { toast } from "react-toastify";

const AdminCharts=lazy(()=>import("../components/AdminCharts"));

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

interface FailedReminder{
  _id:string;
  status:string;
  failureReason:string;
  retryCount:number;
  bounceLog?:string;
  failedAt:string;
  user:{
    name:string;
    email:string;
  };
  job:{
    companyName:string;
    role:string;
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
  const [loading, setLoading] = useState(false);
  const[failedReminders,setFailedReminders]=useState<FailedReminder[]>([]);
  const[reminderStats,setReminderStats]=useState<ReminderStats|null>(null);

  const token = localStorage.getItem("token");

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/users?search=${search}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users);
    } catch (err) {
      if(axios.isAxiosError(err))
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await api.get("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch {
      toast.error("Failed to fetch stats");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchUsers();
      await fetchStats();
      await fetchReminderMonitoring();
    };
    loadData();
  }, []);

  // Toggle user active/suspended
  const toggleUser = async (id: string) => {
    try {
      await api.patch(`/api/admin/users/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
      toast.success("User status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  // Delete single user
  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
      toast.success("User deleted");
    } catch {
      toast.error("Failed to delete user");
    }
  };

  // Handle user selection
  const handleSelectUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) setSelectedUsers([]);
    else setSelectedUsers(users.map((u) => u._id));
  };

  // Bulk actions
  const bulkDelete = async () => {
    if (!confirm(`Delete ${selectedUsers.length} selected users?`)) return;
    for (const id of selectedUsers) {
      await api.delete(`/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    setSelectedUsers([]);
    fetchUsers();
    toast.success("Selected users deleted");
  };

  const bulkToggle = async () => {
    for (const id of selectedUsers) {
      await api.patch(`/api/admin/users/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    setSelectedUsers([]);
    fetchUsers();
    toast.success("Selected users updated");
  };

  // Filtered users by search
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );
   
  const fetchReminderMonitoring=async()=>{
    try{
      const failedRes=await api.get<FailedReminder[]>("/api/admin/reminders/failed",{
        headers:{Authorization:`Bearer${token}`},
      });

      const statsRes=await api.get<ReminderStats>("/api/admin/reminders/health",{
        headers:{Authorization:`Bearer ${token}`},
      });
      setFailedReminders(failedRes.data);
      setReminderStats(statsRes.data);
    }
    catch{
      toast.error("Failed to fetch reminder monitoring data");
    }
  }

  const retryReminder = async (id: string) => {
  try {
    await api.post(`/api/admin/reminders/${id}/retry`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });

    toast.success("Retry scheduled");
    fetchReminderMonitoring();
  } catch {
    toast.error("Retry failed");
  }
};

  if (!stats) return <div className="p-10">Loading...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-10">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* KPI CARDS */}
      <div className="grid grid-cols-4 gap-6">
        <KpiCard title="Total Users" value={stats.totalUsers} color="bg-blue-500" />
        <KpiCard title="Active Users" value={stats.activeUsers} color="bg-green-500" />
        <KpiCard title="Total Jobs" value={stats.totalJobs} color="bg-purple-500" />
        <KpiCard title="Total Events" value={stats.totalEvents} color="bg-yellow-500" />
      </div>

      <Suspense fallback={<div>Loading...</div>}>
      <AdminCharts eventBreakdown={stats.eventBreakdown}/>
      </Suspense>
      {/* Reminder Monitoring */}
<div className="bg-white shadow rounded-xl p-6 space-y-6">
  <h2 className="text-xl font-semibold">Reminder Monitoring</h2>

  {reminderStats && (
    <div className="grid grid-cols-4 gap-4">
      <KpiCard title="Total Reminders" value={reminderStats.total || 0} color="bg-indigo-500" />
      <KpiCard title="Sent" value={reminderStats.sent || 0} color="bg-green-500" />
      <KpiCard title="Failed" value={reminderStats.failed || 0} color="bg-red-500" />
      <KpiCard title="Total Retries" value={reminderStats.totalRetries || 0} color="bg-yellow-500" />
    </div>
  )}

  <div className="overflow-x-auto">
    <table className="w-full table-auto border-collapse mt-4">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2 border">User</th>
          <th className="p-2 border">Application</th>
          <th className="p-2 border">Failure Reason</th>
          <th className="p-2 border">Retries</th>
          <th className="p-2 border">Last Tried</th>
          <th className="p-2 border">Action</th>
        </tr>
      </thead>
      <tbody>
        {failedReminders.map((reminder) => (
          <tr key={reminder._id}>
            <td className="p-2 border">
              {reminder.user.name}
              <br />
              <span className="text-sm text-gray-500">
                {reminder.user.email}
              </span>
            </td>
            <td className="p-2 border">
              {reminder.job.companyName}
              <br />
              {reminder.job.role}
            </td>
            <td className="p-2 border text-red-600">
              {reminder.failureReason}
            </td>
            <td className="p-2 border text-center">
              {reminder.retryCount}
            </td>
            <td className="p-2 border text-center">
              {new Date(reminder.failedAt).toLocaleString()}
            </td>
            <td className="p-2 border text-center">
              <button
                onClick={() => retryReminder(reminder._id)}
                className="bg-blue-600 text-white px-3 py-1 rounded"
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
      {/* User Management */}
      <div className="bg-white shadow rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">User Management</h2>
          <div className="space-x-2">
            {selectedUsers.length > 0 && (
              <>
                <button
                  onClick={bulkToggle}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Toggle Status ({selectedUsers.length})
                </button>
                <button
                  onClick={bulkDelete}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete ({selectedUsers.length})
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center mb-4 space-x-2">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="border p-2 rounded flex-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={fetchUsers}
            className="bg-blue-600 text-white px-3 py-2 rounded"
          >
            Search
          </button>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Role</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Jobs</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-100">
                  <td className="p-2 border text-center">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => handleSelectUser(user._id)}
                    />
                  </td>
                  <td className="p-2 border">{user.name}</td>
                  <td className="p-2 border">{user.email}</td>
                  <td className="p-2 border">{user.role}</td>
                  <td className="p-2 border">
                    <span className={user.isActive ? "text-green-600" : "text-red-600"}>
                      {user.isActive ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="p-2 border text-center">{user.jobs?.length}</td>
                  <td className="p-2 border space-x-2">
                    <button
                      onClick={() => toggleUser(user._id)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      Toggle
                    </button>
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <p className="mt-2 text-gray-500">Loading users...</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
