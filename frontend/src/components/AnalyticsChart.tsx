import { PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import Card from "./Card";

interface Props {
  statusCounts: { _id: string; count: number }[];
  formattedTrend: { name: string; count: number }[];
  COLORS: string[];
}

const AnalyticsCharts = ({ statusCounts, formattedTrend, COLORS }: Props) => {
  return (
    <>
      {/* STATUS PIE */}
      <Card title="Application Status">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusCounts}
              dataKey="count"
              nameKey="_id"
              outerRadius={120}
            >
              {statusCounts.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* TREND */}
      <Card title="Application Trend">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line dataKey="count" stroke="#3b82f6" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </>
  );
};

export default AnalyticsCharts;