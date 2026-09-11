import { useEffect, useState, useRef, lazy, Suspense } from "react";
import api from "../lib/axios";
import { trackEvent } from "../utils/trackEvent";
import KpiCard from "../components/KpiCard";

const AnalyticsCharts = lazy(() => import("../components/AnalyticsChart"));

type StatusCount = {
  _id: string;
  count: number;
};

type TrendItem = {
  _id: {
    year: number;
    month: number;
  };
  count: number;
};

type SkillGap = {
  _id: string;
  count: number;
};

type Insight = {
  _id: string;
  count: number;
};

type AnalyticsData = {
  statusCounts: StatusCount[];
  applicationTrend: TrendItem[];
  skillGaps: SkillGap[];
  aiInsights: Insight[];
};

const COLORS = ["#2563EB", "#F59E0B", "#10B981", "#EF4444"];

const DashboardAnalytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);

  const [range, setRange] = useState("all");
  const [roleInput, setRoleInput] = useState("");
  const [appliedRole, setAppliedRole] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);

  const fetchData = async (initial = false, role = appliedRole) => {
    try {
      if (initial) setLoading(true);
      else setRefreshing(true);

      const res = await api.get(
        `/analytics/dashboard?range=${range}&role=${role}`
      );

      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = async () => {
    setAppliedRole(roleInput);

    trackEvent("analytics_filter_applied", {
      range,
      role: roleInput,
    });

    await fetchData(false, roleInput);
  };

  const exportPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-slate-600 dark:text-slate-300">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-red-500">No analytics available.</p>
      </div>
    );
  }

  const getStatus = (status: string) =>
    data.statusCounts.find((s) => s._id === status)?.count || 0;

  const formattedTrend = data.applicationTrend.map((item) => ({
    name: `${item._id.month}/${item._id.year}`,
    count: item.count,
  }));

  const maxSkillCount = Math.max(...data.skillGaps.map((s) => s.count), 1);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header (Hidden in PDF) */}
        <div className="no-print flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Analytics Dashboard
            </h1>
            <p className="mt-1 text-slate-500">
              Monitor your applications, interview trends and AI insights.
            </p>
          </div>

          <button
            onClick={exportPDF}
            className="rounded-xl bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          >
            Export PDF
          </button>
        </div>

        {/* Filters (Hidden in PDF) */}
        <div className="no-print rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-4 md:grid-cols-3">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="all">All Time</option>
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
            </select>

            <input
              type="text"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              placeholder="Search role..."
              className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />

            <button
              onClick={applyFilters}
              disabled={refreshing}
              className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {refreshing ? "Applying..." : "Apply Filters"}
            </button>
          </div>
        </div>

        {/* Printable Report */}
        <div
          ref={reportRef}
          className="print-area space-y-8 rounded-3xl bg-white p-8 text-slate-900"
        >
          {/* Printable Title */}
          <div className="text-center border-b pb-6">
            <h1 className="text-4xl font-bold">NexusHire Analytics Report</h1>
            <p className="mt-2 text-slate-500">
              Generated on {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* KPI */}
          <div className="avoid-break grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard
              title="Applied"
              value={getStatus("Applied")}
              color="bg-gradient-to-br from-blue-500 to-indigo-600"
            />

            <KpiCard
              title="Interviewed"
              value={getStatus("Interviewed")}
              color="bg-gradient-to-br from-amber-400 to-orange-500"
            />

            <KpiCard
              title="Offers"
              value={getStatus("Offer")}
              color="bg-gradient-to-br from-emerald-500 to-green-600"
            />

            <KpiCard
              title="Rejected"
              value={getStatus("Rejected")}
              color="bg-gradient-to-br from-red-500 to-rose-600"
            />
          </div>

          {/* Charts */}
          <div className="avoid-break">
            <Suspense
              fallback={<div className="p-10 text-center">Loading charts...</div>}
            >
              <AnalyticsCharts
                statusCounts={data.statusCounts}
                formattedTrend={formattedTrend}
                COLORS={COLORS}
              />
            </Suspense>
          </div>

          {/* Page Break */}
          <div className="page-break" />

          {/* Heatmap */}
          <div className="avoid-break rounded-2xl border border-slate-200 p-6">
            <h2 className="mb-5 text-xl font-bold">Skill Gap Heatmap</h2>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {data.skillGaps.map((skill) => {
                const opacity = Math.max(skill.count / maxSkillCount, 0.25);

                return (
                  <div
                    key={skill._id}
                    className="rounded-xl p-5 text-center"
                    style={{
                      background: `rgba(239,68,68,${opacity})`,
                      color: opacity > 0.5 ? "#fff" : "#111827",
                    }}
                  >
                    <p className="font-semibold">{skill._id}</p>
                    <h3 className="mt-2 text-3xl font-bold">{skill.count}</h3>
                    <p className="text-xs opacity-80">Occurrences</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Insights */}
          <div className="avoid-break rounded-2xl border border-slate-200 p-6">
            <h2 className="mb-5 text-xl font-bold">AI Career Insights</h2>

            <div className="space-y-3">
              {data.aiInsights.map((item, index) => (
                <div
                  key={item._id}
                  className="flex items-start gap-4 rounded-xl bg-slate-50 p-4"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                    {index + 1}
                  </div>

                  <p>{item._id}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalytics;