import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import Card from "./Card";

interface Props {
  statusCounts: { _id: string; count: number }[];
  formattedTrend: { name: string; count: number }[];
  COLORS: string[];
}

const AnalyticsCharts = ({
  statusCounts,
  formattedTrend,
  COLORS,
}: Props) => {
  const totalApplications = statusCounts.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const pieData = statusCounts.map((item) => ({
    ...item,
    percentage:
      totalApplications === 0
        ? 0
        : Math.round((item.count / totalApplications) * 100),
  }));

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {/* ---------- STATUS DISTRIBUTION ---------- */}
      <Card
        title="Application Status"
        subtitle="Distribution of all tracked applications"
      >
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="relative w-full lg:w-1/2">
            <div className="w-full min-w-0" style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="count"
                  nameKey="_id"
                  innerRadius={70}
                  outerRadius={105}
                  paddingAngle={4}
                  stroke="white"
                  strokeWidth={4}
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value: number | undefined) => [
                    `${value ?? 0} applications`,
                    "Count",
                  ]}
                  contentStyle={{
                    borderRadius: 14,
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            </div>

            {/* Center KPI */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-xs text-slate-500 uppercase">Total</p>
                <h2 className="text-3xl font-bold">{totalApplications}</h2>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="w-full lg:w-1/2 space-y-3">
            {pieData.map((item, index) => (
              <div
                key={item._id}
                className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor:
                        COLORS[index % COLORS.length],
                    }}
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {item._id}
                  </span>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {item.count}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.percentage}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ---------- APPLICATION TREND ---------- */}
      <Card
        title="Application Trend"
        subtitle="Monthly application growth"
      >
        <div className="h-72">
         <div className="w-full" style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={formattedTrend}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="trendGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#2563EB"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor="#2563EB"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="#E5E7EB"
              />

              <XAxis
                dataKey="name"
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
                contentStyle={{
                  borderRadius: 14,
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                }}
              />

              <Area
                type="monotone"
                dataKey="count"
                fill="url(#trendGradient)"
                stroke="none"
              />

              <Line
                type="monotone"
                dataKey="count"
                stroke="#2563EB"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: "#2563EB",
                  strokeWidth: 2,
                  stroke: "#fff",
                }}
                activeDot={{
                  r: 7,
                  fill: "#1D4ED8",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsCharts;