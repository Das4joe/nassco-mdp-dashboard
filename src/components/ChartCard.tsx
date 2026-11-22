import React from "react";

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  isDark?: boolean;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  accentColor?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  badge,
  badgeColor = "#002F6C",
  isDark = false,
  children,
  headerRight,
  footer,
  className = "",
  accentColor,
}) => {
  return (
    <div
      className={`relative flex flex-col justify-between rounded-xl border p-4 shadow-sm transition-all duration-200 overflow-hidden ${
        isDark
          ? "bg-slate-900/90 border-slate-800 text-slate-100 shadow-slate-950/40"
          : "bg-white border-slate-200/90 text-slate-800 shadow-slate-100"
      } ${className}`}
    >
      {accentColor && (
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: accentColor }}
        />
      )}

      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400 truncate">
                {title}
              </h3>
              {badge && (
                <span
                  className="px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider text-white"
                  style={{ backgroundColor: badgeColor }}
                >
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
                {subtitle}
              </p>
            )}
          </div>
          {headerRight && (
            <div className="flex-shrink-0 flex items-center gap-1.5">
              {headerRight}
            </div>
          )}
        </div>

        <div className="w-full relative min-h-[200px] flex items-center justify-center">
          {children}
        </div>
      </div>

      {footer && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          {footer}
        </div>
      )}
    </div>
  );
};

export default ChartCard;
