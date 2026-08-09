/**
 * ChartCard — v4, uses NASSCO theme classes throughout.
 *
 *   Card:     bg-surface-light dark:bg-surface-dark
 *   Border:   border-line-light dark:border-line-dark
 *   Title:    text-ink-primary dark:text-ink-onDark
 *   Takeaway: text-ink-muted dark:text-ink-onDarkMuted
 *   Footer:   text-ink-faint dark:text-ink-onDarkMuted
 *   Empty:    bg-surface-page dark:bg-surface-darker
 *
 * All chart internals (Recharts) still receive colors from useChartTheme()
 * in each domain component.
 */

import type { FC, ReactNode } from "react";
import { clsx } from "clsx";

interface ChartCardProps {
  title: string;
  takeaway?: string;
  footer?: string;
  children: ReactNode;
  height?: number;
  className?: string;
  accent?: "neutral" | "good" | "warn" | "bad";
  empty?: boolean;
  emptyMessage?: string;
}

const ACCENT_DOT: Record<NonNullable<ChartCardProps["accent"]>, string> = {
  neutral: "bg-ink-faint dark:bg-ink-onDarkMuted",
  good: "bg-status-success",
  warn: "bg-status-warning",
  bad: "bg-status-danger",
};

export const ChartCard: FC<ChartCardProps> = ({
  title,
  takeaway,
  footer,
  children,
  height = 300,
  className,
  accent,
  empty = false,
  emptyMessage = "Not enough data at this level.",
}) => {
  return (
    <div
      className={clsx(
        "bg-surface-light dark:bg-surface-dark",
        "rounded-2xl border border-line-light dark:border-line-dark",
        "p-5 shadow-card",
        className,
      )}
    >
      <div className="flex items-start gap-2 mb-1">
        {accent && (
          <span
            className={clsx(
              "inline-block w-2.5 h-2.5 rounded-full mt-1.5 shrink-0",
              ACCENT_DOT[accent],
            )}
            aria-hidden
          />
        )}
        <h3 className="text-base font-bold text-ink-primary dark:text-ink-onDark leading-tight">
          {title}
        </h3>
      </div>
      {takeaway && (
        <p className="text-xs text-ink-muted dark:text-ink-onDarkMuted mb-4 leading-relaxed">
          {takeaway}
        </p>
      )}

      <div style={{ height: `${height}px`, width: "100%" }}>
        {empty ? (
          <div className="w-full h-full flex items-center justify-center bg-surface-page dark:bg-surface-darker rounded-xl border border-dashed border-line-light dark:border-line-dark">
            <p className="text-xs text-ink-faint dark:text-ink-onDarkMuted">
              {emptyMessage}
            </p>
          </div>
        ) : (
          children
        )}
      </div>

      {footer && (
        <p className="text-[11px] text-ink-faint dark:text-ink-onDarkMuted mt-3 leading-relaxed">
          {footer}
        </p>
      )}
    </div>
  );
};
