import { useEffect, useState } from 'react';
import { publicService } from '../../services/public.service';

const LABELS = [
  'Registered Alumni',
  'Faculty Members',
  'Library Volumes',
  'Years of Excellence',
] as const;

function formatInt(n: number): string {
  return new Intl.NumberFormat().format(Math.max(0, Math.floor(n)));
}

export function StatsBar() {
  const [values, setValues] = useState<[string, string, string, string] | null>(null);

  useEffect(() => {
    let cancelled = false;
    publicService
      .getLandingStats()
      .then((s) => {
        if (cancelled) return;
        setValues([
          `${formatInt(s.registeredAlumni)}+`,
          formatInt(s.facultyMembers),
          `${formatInt(s.libraryVolumes)}+`,
          formatInt(s.yearsExcellence),
        ]);
      })
      .catch(() => {
        if (!cancelled) setValues(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = LABELS.map((label, i) => ({
    label,
    value: values?.[i] ?? '…',
  }));

  return (
    <div className="stats-bar" role="region" aria-label="Institution at a glance">
      <div className="stats-inner">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-item">
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
