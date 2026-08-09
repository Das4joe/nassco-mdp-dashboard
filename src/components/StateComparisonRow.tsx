import clsx from "clsx";
import {
  formatNumber,
  formatPercent,
  titleCase,
  zoneOf,
} from "../lib/formatters";
import type { GeoRecord, DashboardMode, InsightSeverity } from "../lib/types";
import StatusDot from "./StatusDot";

interface StateComparisonRowProps {
  states: GeoRecord[];
  nationalNinRate: number;
  mode: DashboardMode;
  activeState?: string;
  onSelect: (state: string) => void;
}

export default function StateComparisonRow({
  states,
  nationalNinRate,
  mode,
  activeState,
  onSelect,
}: StateComparisonRowProps) {
  const totalHH = states.reduce((sum, s) => sum + s.nsr.total_households, 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {states.map((s) => {
        const isNsr = mode === "nsr";
        const share =
          totalHH > 0 ? (s.nsr.total_households / totalHH) * 100 : 0;

        let severity: InsightSeverity;
        let statusText: string;

        if (isNsr) {
          const gap = s.nsr.nin_verification_rate - nationalNinRate;
          severity = gap > 5 ? "success" : gap < -10 ? "danger" : "warning";
          statusText =
            gap > 5 ? "Above avg" : gap < -10 ? "Below avg" : "On track";
        } else {
          const pov = s.vulnerability.poorest_pct;
          severity = pov > 25 ? "danger" : pov < 10 ? "success" : "warning";
          statusText =
            pov > 25
              ? "High poverty"
              : pov < 10
                ? "Lower poverty"
                : "Avg poverty";
        }

        return (
          <button
            key={s.state}
            onClick={() => onSelect(s.state!)}
            className={clsx(
              "text-left rounded-xl border p-4 transition-all duration-200",
              "bg-surface-light dark:bg-surface-dark",
              activeState === s.state
                ? "border-brand-600 dark:border-nsr-500 shadow-cardHover ring-2 ring-brand-600/20"
                : "border-line-light dark:border-line-dark shadow-card hover:-translate-y-0.5",
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-base font-semibold text-ink-primary dark:text-ink-onDark">
                  {titleCase(s.state!)}
                </div>
                <div className="text-2xs uppercase tracking-wider text-ink-muted dark:text-ink-onDarkMuted">
                  {zoneOf(s.state!)}
                </div>
              </div>
            </div>

            <div
              className={clsx(
                "tabular text-xl font-bold mb-2",
                isNsr
                  ? "text-brand-600 dark:text-nsr-500"
                  : "text-upd-600 dark:text-upd-500",
              )}
            >
              {formatNumber(
                isNsr
                  ? s.nsr.total_households
                  : s.vulnerability.poorest_households,
              )}
              <span className="text-2xs text-ink-muted dark:text-ink-onDarkMuted font-normal ml-1">
                {isNsr ? "HHs total" : "Poor HHs"}
              </span>
            </div>

            <div className="mb-3">
              <div className="h-1.5 rounded-full bg-line-light dark:bg-line-dark overflow-hidden">
                <div
                  className={clsx(
                    "h-full rounded-full transition-all duration-500",
                    isNsr ? "bg-brand-600 dark:bg-nsr-500" : "bg-upd-500",
                  )}
                  style={{
                    width: `${isNsr ? share : s.vulnerability.poorest_pct}%`,
                  }}
                />
              </div>
              <div className="text-2xs text-ink-muted dark:text-ink-onDarkMuted mt-1">
                {isNsr
                  ? `${formatPercent(share, 0)} of national total`
                  : `${formatPercent(s.vulnerability.poorest_pct, 1)} poverty rate`}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-muted dark:text-ink-onDarkMuted">
                {isNsr ? "NIN: " : "Vuln Idx: "}
                <span className="font-semibold text-ink-primary dark:text-ink-onDark">
                  {isNsr
                    ? formatPercent(s.nsr.nin_verification_rate)
                    : s.vulnerability.vulnerability_index.toFixed(1)}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <StatusDot severity={severity} />
                <span className="text-2xs text-ink-muted dark:text-ink-onDarkMuted">
                  {statusText}
                </span>
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
