interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose';
}

const colorMap = {
  indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
};

export default function StatsCard({ title, value, subtitle, color = 'indigo' }: StatsCardProps) {
  return (
    <div className={`rounded-xl border p-6 ${colorMap[color]}`}>
      <div className="text-sm font-medium opacity-80 mb-1">{title}</div>
      <div className="text-3xl font-bold text-white">{value}</div>
      {subtitle && <div className="text-xs mt-2 opacity-70">{subtitle}</div>}
    </div>
  );
}
