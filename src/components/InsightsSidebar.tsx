import { AlertTriangle, Trophy, BarChart3 } from "lucide-react";
import { generateInsights, topLgas, decileBars } from "../lib/insights";
import { THEME } from "../theme";
import type { DashboardMode, DrilldownPath, GeoRecord } from "../lib/types";
import type { DashboardData } from "../lib/loadData";
import StatusDot from "./StatusDot";
import DecileChart from "./DecileChart";

interface InsightsSidebarProps {
  data: DashboardData;
  path: DrilldownPath;
  mode: DashboardMode;
  onDrilldown: (path: Partial<DrilldownPath>) => void;
}

export default function InsightsSidebar({
  data,
  path,
  mode,
  onDrilldown,
}: InsightsSidebarProps) {
  const flags = generateInsights(
    data.national,
    data.states,
    data.lgas,
    path,
    mode,
  );
  const topList = topLgas(data.lgas, path, mode, 5);

  const currentRecord: GeoRecord = path.state
    ? (data.states.find((s: GeoRecord) => s.state === path.state) ??
      data.national)
    : data.national;

  const deciles = decileBars(currentRecord, currentRecord.nsr.total_households);
  const accent = mode === "nsr" ? THEME.nsr.accent : THEME.upd.accent;

  return (
    <div className="flex flex-col gap-4">
      {/* FLAGS PANEL */}
      <div className="rounded-xl border border-line-light dark:border-line-dark bg-surface-light dark:bg-surface-dark p-5 shadow-card">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-ink-onDarkMuted flex items-center gap-2 mb-4">
          <AlertTriangle size={14} /> Attention Flags
        </h3>

        {flags.length === 0 ? (
          <p className="text-sm text-ink-faint">
            No critical flags at this level.
          </p>
        ) : (
          <div className="space-y-3">
            {flags.map((f, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="mt-1">
                  <StatusDot severity={f.severity} size="md" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-ink-primary dark:text-ink-onDark">
                    {f.title}
                  </div>
                  <div className="text-xs text-ink-muted dark:text-ink-onDarkMuted">
                    {f.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TOP LGAS PANEL */}
      <div className="rounded-xl border border-line-light dark:border-line-dark bg-surface-light dark:bg-surface-dark p-5 shadow-card">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-ink-onDarkMuted flex items-center gap-2 mb-4">
          <Trophy size={14} /> Highest {mode === "nsr" ? "Volume" : "Poverty"}{" "}
          LGAs
        </h3>

        <div className="space-y-2">
          {topList.map((item) => (
            <button
              key={item.name}
              onClick={() => onDrilldown({ state: item.state, lga: item.name })}
              className="w-full flex items-center justify-between p-2 -mx-2 rounded hover:bg-brand-50 dark:hover:bg-brand-900/30 transition text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-ink-faint w-4">
                  {item.rank}.
                </span>
                <div>
                  <div className="text-sm font-medium text-ink-primary dark:text-ink-onDark">
                    {item.name}
                  </div>
                  {!path.state && (
                    <div className="text-2xs text-ink-muted">{item.state}</div>
                  )}
                </div>
              </div>
              <div
                className="text-sm font-bold tabular"
                style={{ color: accent }}
              >
                {item.sublabel}{" "}
                <span className="text-2xs font-normal opacity-70">HHs</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* DECILE CHART PANEL */}
      <div className="rounded-xl border border-line-light dark:border-line-dark bg-surface-light dark:bg-surface-dark p-5 shadow-card">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-ink-onDarkMuted flex items-center gap-2 mb-2">
          <BarChart3 size={14} /> Poverty Distribution
        </h3>
        <DecileChart data={deciles} accentColor={THEME.upd.accent} />
        <div className="mt-3 text-xs text-center text-ink-muted dark:text-ink-onDarkMuted border-t border-line-light dark:border-line-dark pt-3">
          Poorest 30% highlighted
        </div>
      </div>
    </div>
  );
}
