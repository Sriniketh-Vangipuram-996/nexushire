import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../lib/axios";
import axios from "axios";
import { toast } from "react-toastify";

import { useAuthStore } from "../store/authStore";
import { disconnectSocket } from "../socket";

import ConfirmModal from "../components/ConfirmModal";
import TableView from "../components/TableView";
import KanbanView from "../components/KanbanView";

type Job = {
  _id: string;
  companyName: string;
  role: string;
  status: string;
  appliedDate: string;
  notes?: string;
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState("Interviewed");
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchJobs = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/jobs");
      setJobs(res.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Failed to load jobs");
      } else {
        setError("Failed to load jobs");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleLogout = async () => {
    await logout();
    disconnectSocket();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleStatusChange = async (id: string, status: string) => {
    const previous = [...jobs];

    setJobs((prev) =>
      prev.map((job) =>
        job._id === id ? { ...job, status } : job
      )
    );

    try {
      await api.patch(`/jobs/${id}/status`, { status });
    } catch {
      setJobs(previous);
      toast.error("Status update failed");
    }
  };

  const confirmDelete = async () => {
    if (!jobToDelete) return;

    const previous = [...jobs];

    setJobs((prev) =>
      prev.filter((job) => job._id !== jobToDelete)
    );

    setIsModalOpen(false);

    try {
      await api.delete(`/jobs/${jobToDelete}`);
      toast.success("Job deleted");
    } catch {
      setJobs(previous);
      toast.error("Delete failed");
    } finally {
      setJobToDelete(null);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedJobs((prev) =>
      prev.includes(id)
        ? prev.filter((j) => j !== id)
        : [...prev, id]
    );
  };

  const filteredJobs = jobs.filter((job) => {
    const search =
      job.companyName
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase()) ||
      job.role
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase());

    const status =
      statusFilter === "All" ||
      job.status === statusFilter;

    return search && status;
  });

  const handleSelectAll = () => {
    if (selectedJobs.length === filteredJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(filteredJobs.map((j) => j._id));
    }
  };

  const handleBulkUpdate = async () => {
    if (!selectedJobs.length) return;

    setIsBulkLoading(true);

    const previous = [...jobs];

    setJobs((prev) =>
      prev.map((job) =>
        selectedJobs.includes(job._id)
          ? { ...job, status: bulkStatus }
          : job
      )
    );

    try {
      await api.patch("/jobs/bulk/status", {
        jobIds: selectedJobs,
        status: bulkStatus,
      });

      toast.success("Status updated");
      setSelectedJobs([]);
    } catch {
      setJobs(previous);
      toast.error("Bulk update failed");
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedJobs.length) return;

    const previous = [...jobs];
    setIsBulkLoading(true);

    setJobs((prev) =>
      prev.filter((job) => !selectedJobs.includes(job._id))
    );

    try {
      await api.delete("/jobs/bulk", {
        data: { jobIds: selectedJobs },
      });

      toast.success("Jobs deleted");
      setSelectedJobs([]);
    } catch {
      setJobs(previous);
      toast.error("Bulk delete failed");
    } finally {
      setIsBulkLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-8 shadow">
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchJobs}
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // const applied = jobs.filter((j) => j.status === "Applied").length;
  const interviewed = jobs.filter((j) => j.status === "Interviewed").length;
  const offers = jobs.filter((j) => j.status === "Offer").length;
  const rejected = jobs.filter((j) => j.status === "Rejected").length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Welcome back, {user?.name || "User"} 👋
          </h1>

          <p className="mt-1 text-slate-500">
            Manage your applications and keep your hiring pipeline organized.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">

          <Link
            to="/jobs/new"
            className="rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
          >
            + Add Job
          </Link>

          <Link
            to="/analytics"
            className="rounded-xl border border-slate-300 px-5 py-3 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Analytics
          </Link>

          <Link
            to="/profile"
            className="rounded-xl border border-slate-300 px-5 py-3 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Profile
          </Link>

          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="rounded-xl bg-violet-600 px-5 py-3 text-white hover:bg-violet-700"
            >
              Admin
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="rounded-xl border border-red-200 px-5 py-3 text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-sm text-slate-500">Total Jobs</p>
          <h2 className="mt-2 text-3xl font-bold">{jobs.length}</h2>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-sm text-slate-500">Interviews</p>
          <h2 className="mt-2 text-3xl font-bold text-amber-500">{interviewed}</h2>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-sm text-slate-500">Offers</p>
          <h2 className="mt-2 text-3xl font-bold text-emerald-500">{offers}</h2>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-sm text-slate-500">Rejected</p>
          <h2 className="mt-2 text-3xl font-bold text-rose-500">{rejected}</h2>
        </div>

      </div>

      {/* Search + Filter */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">

        <div className="grid md:grid-cols-3 gap-4">

          <input
            placeholder="Search company or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
          >
            <option>All</option>
            <option>Applied</option>
            <option>Interviewed</option>
            <option>Offer</option>
            <option>Rejected</option>
          </select>

          <div className="flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 font-medium">
            {filteredJobs.length} Results
          </div>

        </div>
      </div>

      {/* Bulk Actions */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={
              filteredJobs.length > 0 &&
              selectedJobs.length === filteredJobs.length
            }
            onChange={handleSelectAll}
          />

          <span className="text-sm">
            {selectedJobs.length} Selected
          </span>
        </div>

        <div className="flex gap-3 flex-wrap">

          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="rounded-xl border px-3 py-2 dark:bg-slate-800"
          >
            <option>Applied</option>
            <option>Interviewed</option>
            <option>Offer</option>
            <option>Rejected</option>
          </select>

          <button
            onClick={handleBulkUpdate}
            disabled={!selectedJobs.length || isBulkLoading}
            className="rounded-xl bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            Update
          </button>

          <button
            onClick={handleBulkDelete}
            disabled={!selectedJobs.length || isBulkLoading}
            className="rounded-xl bg-red-600 px-4 py-2 text-white disabled:opacity-50"
          >
            Delete
          </button>

        </div>
      </div>

      {/* View Toggle */}
      <div className="flex justify-end">
        <div className="rounded-xl bg-slate-200 dark:bg-slate-800 p-1 flex">

          <button
            onClick={() => setViewMode("table")}
            className={`rounded-lg px-4 py-2 ${
              viewMode === "table"
                ? "bg-white dark:bg-slate-700 shadow"
                : ""
            }`}
          >
            Table
          </button>

          <button
            onClick={() => setViewMode("kanban")}
            className={`rounded-lg px-4 py-2 ${
              viewMode === "kanban"
                ? "bg-white dark:bg-slate-700 shadow"
                : ""
            }`}
          >
            Kanban
          </button>

        </div>
      </div>

      {/* Jobs */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">

        {filteredJobs.length === 0 ? (
          <div className="py-20 text-center">

            <h3 className="text-xl font-semibold">
              No applications found
            </h3>

            <p className="mt-2 text-slate-500">
              Start by creating your first job.
            </p>

            <Link
              to="/jobs/new"
              className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-3 text-white"
            >
              Add Job
            </Link>

          </div>
        ) : viewMode === "table" ? (
          <TableView
            jobs={filteredJobs}
            selectedJobs={selectedJobs}
            onSelect={handleSelect}
            onStatusChange={handleStatusChange}
            onDeleteClick={(id) => {
              setJobToDelete(id);
              setIsModalOpen(true);
            }}
          />
        ) : (
          <KanbanView
            jobs={filteredJobs}
            onStatusChange={handleStatusChange}
          />
        )}

      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        message="Delete this job application?"
        onConfirm={confirmDelete}
        onCancel={() => setIsModalOpen(false)}
        confirmText="Delete"
        cancelText="Cancel"
      />

    </div>
  );
};

export default DashboardPage;