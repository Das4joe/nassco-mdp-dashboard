import type React from "react";
import { isValidElement } from "react";
import type { LucideIcon } from "lucide-react";

export interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  tag?: string;
  badge?: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  tone?: "positive" | "warning" | "critical" | "neutral" | string;
  accentColor?: string;
  isDark?: boolean;
  icon?:
    | LucideIcon
    | React.ComponentType<{ className?: string }>
    | React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  tag,
  badge,
  change,
  trend,
  tone = "neutral",
  isDark = true,
  icon: Icon,
  className = "",
  onClick,
}) => {
  const displayTag = tag || badge;

  const toneBg =
    tone === "critical"
      ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
      : tone === "warning"
        ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
        : tone === "positive"
          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
          : "bg-teal-500/15 text-teal-300 border-teal-500/30";

  // Safely handle Lucide forwardRef components, functional components, and JSX elements
  const renderIcon = () => {
    if (!Icon) return null;
    if (isValidElement(Icon)) {
      return Icon;
    }
    const IconComponent = Icon as React.ComponentType<{ className?: string }>;
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-200 ${
        isDark
          ? "border-[#134e4a]/40 bg-[#0b2422]/90 text-white hover:border-[#2dd4bf]/40"
          : "border-slate-200 bg-white text-slate-900 shadow-sm hover:border-teal-500"
      } ${onClick ? "cursor-pointer hover:scale-[1.01]" : ""} ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-400/90 truncate">
            {title}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white truncate">
              {typeof value === "number" ? value.toLocaleString() : value}
            </span>
            {change && (
              <span
                className={`text-xs font-medium ${
                  trend === "up"
                    ? "text-emerald-400"
                    : trend === "down"
                      ? "text-rose-400"
                      : "text-slate-400"
                }`}
              >
                {change}
              </span>
            )}
          </div>
          {(subtitle || displayTag) && (
            <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
              {displayTag && (
                <span
                  className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold border ${toneBg}`}
                >
                  {displayTag}
                </span>
              )}
              {subtitle && (
                <span className="text-[11px] text-slate-400 truncate">
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </div>

        {Icon && (
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${toneBg}`}
          >
            {renderIcon()}
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
