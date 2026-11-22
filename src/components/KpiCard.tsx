import React from "react";

export interface KpiCardProps {
  title?: string;
  label?: string;
  value: string | number;
  tag?: string;
  badge?: string;
  subtitle?: string;
  accentColor?: string;
  color?: string;
  isDark?: boolean;
  darkMode?: boolean;
  icon?: React.ReactNode;
  trend?: {
    value: number | string;
    isPositive?: boolean;
    label?: string;
  };
  onClick?: () => void;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  label,
  value,
  tag,
  badge,
  subtitle,
  accentColor,
  color,
  isDark = false,
  darkMode = false,
  icon,
  trend,
  onClick,
  className = "",
}) => {
  const activeDark = isDark || darkMode;
  const cardTitle = title || label || "";
  const cardTag = tag || badge || subtitle;
  const cardColor = accentColor || color || "#002F6C";

  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col justify-between rounded-xl border p-4 shadow-sm transition-all duration-200 overflow-hidden ${
        activeDark
          ? "bg-slate-900/90 border-slate-800 text-slate-100 shadow-slate-950/40"
          : "bg-white border-slate-200/90 text-slate-900 shadow-slate-100"
      } ${onClick ? "cursor-pointer hover:border-blue-500 hover:shadow-md" : ""} ${className}`}
    >
      {/* Top Accent Strip */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: cardColor }}
      />

      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 truncate">
            {cardTitle}
          </span>
          {icon && <span className="text-slate-400 flex-shrink-0">{icon}</span>}
        </div>

        <div className="flex items-baseline justify-between gap-2 mt-1">
          <div className="font-mono text-2xl font-black tracking-tight truncate text-slate-900 dark:text-slate-50">
            {value}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-xs">
        {cardTag && (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase"
            style={{
              backgroundColor: `${cardColor}15`,
              color: cardColor,
            }}
          >
            {cardTag}
          </span>
        )}

        {trend && (
          <div
            className={`flex items-center gap-1 text-[11px] font-semibold ${
              trend.isPositive ? "text-emerald-600" : "text-red-500"
            }`}
          >
            <span>{trend.isPositive ? "↑" : "↓"}</span>
            <span>{trend.value}</span>
            {trend.label && (
              <span className="text-slate-400 font-normal ml-0.5">
                {trend.label}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
