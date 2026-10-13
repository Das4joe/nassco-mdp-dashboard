import React from "react";

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  height?: number;
  children?: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  height = 305,
  children,
}) => {
  return (
    <div className="rounded-xl border border-line-light dark:border-line-dark bg-surface-light dark:bg-surface-dark shadow-card p-5 flex flex-col justify-between h-full">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-ink dark:text-ink-onDark">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-ink-muted dark:text-ink-onDarkMuted mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex-1 w-full" style={{ height }}>
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
