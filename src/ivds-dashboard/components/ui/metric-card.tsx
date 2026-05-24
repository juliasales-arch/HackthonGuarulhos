import type { ReactNode } from 'react';
import { LEVEL_CONFIG, type IvdsLevel } from '@/lib/ivds-data';

type MetricCardProps = {
  label: string;
  value: string | number;
  hint: string;
  accent: string;
  icon?: ReactNode;
};

export function MetricCard({ label, value, hint, accent, icon }: MetricCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl border bg-[color:var(--bg-card)] p-5 shadow-soft backdrop-blur-xl"
      style={{ borderColor: 'var(--border)' }}
    >
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{
          background: `linear-gradient(90deg, ${accent} 0%, rgba(255,255,255,0.12) 100%)`
        }}
      />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--text-muted)]">{label}</p>
          <div className="mt-2 text-3xl font-extrabold leading-none text-[color:var(--text-primary)]">{value}</div>
          <p className="mt-2 text-sm text-[color:var(--text-secondary)]">{hint}</p>
        </div>
        {icon ? (
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl border"
            style={{ borderColor: `${accent}40`, background: `${accent}14`, color: accent }}
          >
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}

type LevelBadgeProps = {
  level: IvdsLevel;
  compact?: boolean;
};

export function LevelBadge({ level, compact = false }: LevelBadgeProps) {
  const config = LEVEL_CONFIG[level];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 font-semibold ${compact ? 'py-1 text-[10px] uppercase tracking-[0.22em]' : 'py-1.5 text-xs uppercase tracking-[0.22em]'}`}
      style={{
        borderColor: config.border,
        color: config.color,
        background: config.background
      }}
    >
      {config.label}
    </span>
  );
}
