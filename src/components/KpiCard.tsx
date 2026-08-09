/**
 * KpiCard — Minimal executive KPI card
 */

import type { ReactNode } from "react";
import clsx from "clsx";

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: ReactNode;
  accent?: string;
  onClick?: () => void;
}

export default function KpiCard({
  label,
  value,
  sub,
  icon,
  accent,
  onClick,
}: KpiCardProps) {
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={clsx(
        "group relative rounded-xl border p-5 transition-all duration-200",
        "bg-surface-light border-line-light shadow-card",
        "dark:bg-surface-dark dark:border-line-dark",
        isClickable &&
          "cursor-pointer hover:shadow-cardHover hover:-translate-y-0.5",
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-onDarkMuted">
          {label}
        </span>
        {icon && (
          <span className="text-ink-faint dark:text-ink-onDarkMuted group-hover:text-brand-600 dark:group-hover:text-nsr-500 transition-colors">
            {icon}
          </span>
        )}
      </div>

      <div
        className="tabular text-3xl md:text-4xl font-bold leading-tight text-ink-primary dark:text-ink-onDark"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </div>

      {sub && (
        <div className="mt-1.5 text-2xs text-ink-muted dark:text-ink-onDarkMuted">
          {sub}
        </div>
      )}
    </div>
  );
}
