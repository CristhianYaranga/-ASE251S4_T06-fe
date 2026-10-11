import React from 'react';

export function KpiCard({
  label,
  value,
  unit,
  subtitle,
  trendValue,
  trendUp = true,
  icon,
  iconBg = 'bg-emerald-100 text-[var(--color-arona-600)]',
}) {
  return (
    <div className="arona-card p-5 hover:shadow-lg transition-all duration-200 group cursor-default">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2.5">
          {icon && (
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
            >
              <span className="material-icons-outlined text-lg">{icon}</span>
            </div>
          )}
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
            {label}
          </span>
        </div>

        {trendValue && (
          <span
            className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
              trendUp ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
            }`}
          >
            <span className="material-icons-outlined text-sm">
              {trendUp ? 'trending_up' : 'trending_down'}
            </span>
            {trendValue}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2 mt-2">
        <span className="text-3xl font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-arona-500)] transition-colors tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">
            {unit}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs mt-2 text-[var(--color-text-muted)] line-clamp-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}
