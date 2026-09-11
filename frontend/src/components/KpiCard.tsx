interface KpiCardProps {
  title: string;
  value: number;
  color: string;
}

const KpiCard = ({ title, value, color }: KpiCardProps) => (
  <div className={`${color} rounded-2xl p-5 text-white shadow-lg`}>
    <p className="text-sm opacity-90">{title}</p>
    <h2 className="text-3xl font-bold mt-2">{value}</h2>
  </div>
);

export default KpiCard;