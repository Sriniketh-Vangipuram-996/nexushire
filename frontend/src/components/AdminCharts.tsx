import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  eventBreakdown: { _id: string; count: number }[];
}

const AdminCharts = ({ eventBreakdown }: Props) => {
  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4">Feature Usage</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={eventBreakdown}>
          <XAxis dataKey="_id" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdminCharts;