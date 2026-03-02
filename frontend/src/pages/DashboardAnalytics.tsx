import { useEffect, useState, useRef } from "react";
import api from "../lib/axios"; 
import { trackEvent } from "../utils/trackEvent";
import Card from "../components/Card";
import KpiCard from "../components/KpiCard";
import { lazy,Suspense } from "react";

const AnalyticsCharts=lazy(()=>import("../components/AnalyticsChart"));

type StatusCount = {
  _id: string;
  count: number;
};

type TrendItem = {
  _id: { year: number; month: number };
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

const COLORS = ["#3b82f6", "#22c55e", "#facc15", "#ef4444"];

const DashboardAnalytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [range, setRange] = useState("all");
  const [loading, setLoading] = useState(true);
  const [roleInput, setRoleInput] = useState(""); // typing state
  const [appliedRole, setAppliedRole] = useState(""); // actual filter used
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, [range, appliedRole]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await api.get(
        `/api/analytics/dashboard?range=${range}&role=${appliedRole}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async () => {
  if (!dashboardRef.current) return;

  const html2canvas = (await import("html2canvas")).default;
  const jsPDF = (await import("jspdf")).default;

  const canvas = await html2canvas(dashboardRef.current);
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const imgWidth = 190;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
  pdf.save("NexusHire_Analytics.pdf");
};

  if (loading)
    return (
      <div className="p-10 text-center text-lg font-semibold">
        Loading Analytics...
      </div>
    );

  if (!data)
    return (
      <div className="p-10 text-center text-red-500">
        No analytics available.
      </div>
    );

  // KPI counts
  const getStatus = (status: string) =>
    data.statusCounts.find((s) => s._id === status)?.count || 0;

  const applied = getStatus("Applied");
  const interviewed = getStatus("Interview");
  const offer = getStatus("Offer");
  const rejected = getStatus("Rejected");

  // Trend formatting
  const formattedTrend = data.applicationTrend.map((item) => ({
    name: `${item._id.month}/${item._id.year}`,
    count: item.count,
  }));

  // Heatmap scaling
  const maxSkillCount =
    Math.max(...data.skillGaps.map((s) => s.count), 1) || 1;

  return (
    <div className="p-8 space-y-10 bg-gray-50 min-h-screen" ref={dashboardRef}>
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <button
          onClick={exportPDF}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Export PDF
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex gap-4">
        <select
          className="border p-2 rounded"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          <option value="all">All Time</option>
          <option value="3m">Last 3 Months</option>
          <option value="6m">Last 6 Months</option>
        </select>
         
         <button
          onClick={() => {
          setAppliedRole(roleInput);
          trackEvent("analytics_filter_applied", {
            range,
            role: roleInput,
          });
        }}
        
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Apply Filters
        </button>

        <input
          placeholder="Filter by Role"
          className="border p-2 rounded"
          value={roleInput}
          onChange={(e) => setRoleInput(e.target.value)}
        />
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-4 gap-6">
        <KpiCard title="Applied" value={applied} color="bg-blue-500" />
        <KpiCard title="Interviewed" value={interviewed} color="bg-yellow-500" />
        <KpiCard title="Offers" value={offer} color="bg-green-500" />
        <KpiCard title="Rejected" value={rejected} color="bg-red-500" />
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <AnalyticsCharts statusCounts={data.statusCounts}
        formattedTrend={formattedTrend}
        COLORS={COLORS}
        />
      </Suspense>
      {/* HEATMAP */}
      <Card title="Skill Gap Heatmap">
        <div className="grid grid-cols-4 gap-4">
          {data.skillGaps.map((skill) => {
  const intensity = Math.max(skill.count / maxSkillCount, 0.25);

  const textColor = intensity > 0.5 ? "#ffffff" : "#1f2937"; // white or gray-800

  return (
    <div
      key={skill._id}
      className="p-4 rounded-lg text-center"
      style={{
        backgroundColor: `rgba(239,68,68,${intensity})`,
        color: textColor,
      }}
    >
      {skill._id}
      <div className="text-sm">{skill.count}</div>
    </div>
  );
})}

        </div>
      </Card>

      {/* AI INSIGHTS */}
      <Card title="AI Career Insights">
        <ul className="list-disc ml-6 space-y-2">
          {data.aiInsights.map((insight) => (
            <li key={insight._id}>{insight._id}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

export default DashboardAnalytics;
