interface KPICardProps {
  label: string;
  value: string | number;
  sub?: string;
  className?: string;
}

export function KPICard({ label, value, sub, className = '' }: KPICardProps) {
  return (
    <div className={`kpi-card ${className}`}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}
