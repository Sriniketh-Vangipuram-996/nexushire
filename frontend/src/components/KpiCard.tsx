
interface KpiCardProps{
    title:string;
    value:number;
    color:string;
}

const KpiCard = ({ title, value, color }: KpiCardProps) => (
  <div className={`${color} text-white rounded-xl p-6 shadow`}>
    <h3 className="text-lg">{title}</h3>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);

export default KpiCard;