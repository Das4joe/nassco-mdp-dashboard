import type { GeoRecord, DashboardMode, InsightSeverity } from "../lib/types";

interface Props {
  states: GeoRecord[];
  national: GeoRecord;
  mode: DashboardMode;
  selectedState?: string;
  onSelectState: (state: string | null) => void;
}

export function StateComparisonRow({
  states,
  national,
  mode,
  selectedState,
  onSelectState,
}: Props) {
  const isNsr = mode === "nsr";
  const nationalTotal = national.nsr.total_households;
  const nationalNinRate = national.nsr.nin_verification_rate ?? 0;

  const formatNumber = (val?: number) => (val ?? 0).toLocaleString();
  const formatPercent = (val?: number, decimals = 1) =>
    `${(val ?? 0).toFixed(decimals)}%`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {states.map((s) => {
        const stateName = s.state || "Unknown";
        const isSelected = selectedState === stateName;
        const hh = isNsr
          ? s.nsr.total_households
          : (s.vulnerability?.poorest_households ?? 0);
        const share = nationalTotal > 0 ? (hh / nationalTotal) * 100 : 0;

        const gap = (s.nsr.nin_verification_rate ?? 0) - nationalNinRate;
        let severity: InsightSeverity = "info";

        if (!isNsr) {
          const pov = s.vulnerability?.poorest_pct ?? 0;
          severity = pov > 25 ? "danger" : pov < 10 ? "success" : "warning";
        } else {
          severity = gap > 2 ? "success" : gap < -2 ? "warning" : "info";
        }

        return (
          <div
            key={stateName}
            onClick={() => onSelectState(isSelected ? null : stateName)}
            className={`cursor-pointer rounded-xl border p-4 transition-all shadow-card ${
              isSelected
                ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 ring-2 ring-brand-500/20"
                : "border-line-light dark:border-line-dark bg-surface-light dark:bg-surface-dark hover:border-brand-300 dark:hover:border-brand-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-bold text-ink-primary dark:text-ink-onDark">
                {stateName}
              </div>
              <div
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  severity === "danger"
                    ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                    : severity === "warning"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                      : severity === "success"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                }`}
              >
                {isNsr
                  ? gap >= 0
                    ? `+${gap.toFixed(1)}pp NIN`
                    : `${gap.toFixed(1)}pp NIN`
                  : `${formatPercent(s.vulnerability?.poorest_pct, 1)} Pov`}
              </div>
            </div>

            <div className="text-xl font-black text-ink-primary dark:text-ink-onDark mb-1">
              {formatNumber(
                isNsr
                  ? s.nsr.total_households
                  : (s.vulnerability?.poorest_households ?? 0),
              )}
              <span className="text-xs font-normal text-ink-muted dark:text-ink-onDarkMuted ml-1">
                HHs ({share.toFixed(1)}%)
              </span>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden my-2">
              <div
                className="bg-brand-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${isNsr ? share : (s.vulnerability?.poorest_pct ?? 0)}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-ink-muted dark:text-ink-onDarkMuted">
              <span>
                {isNsr
                  ? `${formatNumber(s.nsr.total_individuals)} Indiv.`
                  : `${formatPercent(s.vulnerability?.poorest_pct, 1)} poverty rate`}
              </span>
              <span className="font-semibold text-ink-primary dark:text-ink-onDark">
                {isNsr
                  ? formatPercent(s.nsr.nin_verification_rate ?? 0)
                  : (s.vulnerability?.vulnerability_index ?? 0).toFixed(1)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StateComparisonRow;
