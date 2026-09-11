import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

interface Props {
  eventBreakdown: { _id: string; count: number }[];
}

const COLORS = [
  "#2563EB",
  "#7C3AED",
  "#0EA5E9",
  "#14B8A6",
  "#F59E0B",
  "#EC4899",
];

const AdminCharts = ({ eventBreakdown }: Props) => {
  const totalEvents = eventBreakdown.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const topFeature =
    eventBreakdown.length > 0
      ? [...eventBreakdown].sort((a, b) => b.count - a.count)[0]
      : null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Analytics
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            Feature Usage
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Platform feature engagement across all users
          </p>
        </div>

        <div className="flex gap-3">
          <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
            <p className="text-xs text-slate-500">Total Events</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {totalEvents}
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50 px-4 py-3 dark:bg-blue-950/40">
            <p className="text-xs text-blue-600 dark:text-blue-300">
              Top Feature
            </p>
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-200">
              {topFeature?._id || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <div className="w-full min-w-0">
        <ResponsiveContainer width="99%" aspect={1.8}>
          <BarChart
            data={eventBreakdown}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              strokeDasharray="4 4"
              stroke="#E2E8F0"
            />

            <XAxis
              dataKey="_id"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748B", fontSize: 12 }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748B", fontSize: 12 }}
            />

            <Tooltip
              cursor={{ fill: "rgba(59,130,246,0.08)" }}
              contentStyle={{
                borderRadius: "14px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                background: "#fff",
              }}
            />

            <Bar
              dataKey="count"
              radius={[10, 10, 0, 0]}
              fill="url(#barGradient)"
            >
              {eventBreakdown.map((_, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom stats */}
      {eventBreakdown.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {eventBreakdown.map((item, index) => (
            <div
              key={item._id}
              className="rounded-2xl border border-slate-200 p-3 dark:border-slate-700"
            >
              <div
                className="mb-2 h-2 w-10 rounded-full"
                style={{
                  backgroundColor: COLORS[index % COLORS.length],
                }}
              />
              <p className="truncate text-xs text-slate-500">{item._id}</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                {item.count}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCharts;