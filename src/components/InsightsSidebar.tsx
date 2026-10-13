import React from "react";
import type { DashboardData } from "../lib/loadData";
import type {
  GeoRecord,
  DrilldownPath,
  DashboardMode,
  InsightFlag,
  RankedItem,
} from "../lib/types";
import { generateInsights, topLgas } from "../lib/insights";
import DecileChart from "./DecileChart";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

interface InsightsSidebarProps {
  data: DashboardData;
  path: DrilldownPath;
  mode?: DashboardMode;
  onDrilldown?: (path: DrilldownPath) => void;
}

export const InsightsSidebar: React.FC<InsightsSidebarProps> = ({
  data,
  path,
  mode = "nsr",
}) => {
  const flags = generateInsights(data, path, mode);
  const topList = topLgas(data, mode, 5);

  const normU = (s?: string) => (s ?? "").trim().toUpperCase();
  const normL = (s?: string) => (s ?? "").trim().toLowerCase();

  const currentRecord: GeoRecord = path.community
    ? (data.communities.find(
        (r) =>
          normU(r.state) === normU(path.state) &&
          normL(r.lga) === normL(path.lga) &&
          normL(r.ward) === normL(path.ward) &&
          normL(r.community) === normL(path.community),
      ) ?? data.national)
    : path.ward
      ? (data.wards.find(
          (r) =>
            normU(r.state) === normU(path.state) &&
            normL(r.lga) === normL(path.lga) &&
            normL(r.ward) === normL(path.ward),
        ) ?? data.national)
      : path.lga
        ? (data.lgas.find(
            (r) =>
              normU(r.state) === normU(path.state) &&
              normL(r.lga) === normL(path.lga),
          ) ?? data.national)
        : path.state
          ? (data.states.find((s) => normU(s.state) === normU(path.state)) ??
            data.national)
          : data.national;

  const renderIcon = (severity: string) => {
    switch (severity) {
      case "success":
        return <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />;
      case "warning":
        return <AlertTriangle size={16} className="text-amber-500 shrink-0" />;
      case "danger":
        return <AlertCircle size={16} className="text-rose-500 shrink-0" />;
      default:
        return <Info size={16} className="text-sky-500 shrink-0" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Flags Panel */}
      <div className="bg-surface-light dark:bg-surface-dark border border-line-light dark:border-line-dark rounded-xl p-4 shadow-card space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-ink-onDarkMuted flex items-center gap-2">
          <AlertCircle size={15} />
          Attention Flags
        </h3>
        <div className="space-y-2">
          {flags.map((f: InsightFlag, i: number) => (
            <div
              key={f.id || i}
              className="p-2.5 rounded-lg bg-surface-page dark:bg-surface-darker border border-line-light dark:border-line-dark flex items-start gap-2.5"
            >
              {renderIcon(f.severity)}
              <div>
                <div className="text-xs font-bold text-ink-primary dark:text-ink-onDark">
                  {f.title}
                </div>
                {f.body && (
                  <div className="text-[11px] text-ink-muted dark:text-ink-onDarkMuted mt-0.5">
                    {f.body}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top LGAs Panel */}
      <div className="bg-surface-light dark:bg-surface-dark border border-line-light dark:border-line-dark rounded-xl p-4 shadow-card space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-ink-onDarkMuted">
          Highest Volume LGAs
        </h3>
        <div className="space-y-2">
          {topList.map((item: RankedItem) => (
            <div
              key={item.name}
              className="flex items-center justify-between text-xs py-1 border-b border-line-light/50 dark:border-line-dark/50 last:border-none"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-ink-faint text-[11px]">
                  {item.rank}.
                </span>
                <div>
                  <div className="font-semibold text-ink-primary dark:text-ink-onDark">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-ink-muted uppercase">
                    {item.state}
                  </div>
                </div>
              </div>
              <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                {item.sublabel}{" "}
                <span className="text-[10px] font-normal text-ink-muted">
                  HHs
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Decile Chart Panel */}
      <div className="bg-surface-light dark:bg-surface-dark border border-line-light dark:border-line-dark rounded-xl p-4 shadow-card">
        <DecileChart record={currentRecord} />
      </div>
    </div>
  );
};

export default InsightsSidebar;
