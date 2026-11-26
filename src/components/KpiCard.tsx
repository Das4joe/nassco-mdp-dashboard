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
  accentColor = "#2DD4BF",
  isDark = true,
  icon,
  onClick,
  className = "",
}) => {
  const displayTitle = title || label || "";
  const displayTag = tag || badge;

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-2xl border transition-all duration-200 overflow-hidden ${
        isDark
          ? "bg-slate-900/90 border-slate-700/80 shadow-lg shadow-black/40 hover:border-slate-600"
          : "bg-white border-slate-200 shadow-md hover:border-slate-300"
      } ${onClick ? "cursor-pointer hover:scale-[1.01]" : ""} ${className}`}
    >
      {/* Accent Top Border Indicator */}
      <div
        className="absolute top-0 left-0 right-0 h-1 transition-all duration-300"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span
            className={`text-xs font-bold uppercase tracking-wider block ${
              isDark ? "text-slate-200" : "text-slate-600"
            }`}
          >
            {displayTitle}
          </span>
          <div
            className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1"
            style={{ color: accentColor }}
          >
            {value}
          </div>
        </div>

        {icon && (
          <div
            className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${
              isDark
                ? "bg-slate-800/80 border-slate-700 text-teal-300"
                : "bg-slate-100 border-slate-200 text-teal-700"
            }`}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t flex flex-wrap items-center justify-between gap-2 border-slate-800/60">
        {subtitle && (
          <span
            className={`text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}
          >
            {subtitle}
          </span>
        )}

        {displayTag && (
          <span
            className="text-[11px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-md border"
            style={{
              backgroundColor: `${accentColor}18`,
              borderColor: `${accentColor}50`,
              color: accentColor,
            }}
          >
            {displayTag}
          </span>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
