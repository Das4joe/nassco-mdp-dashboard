import type { GeoRecord, DashboardMode } from "../lib/types";

interface Props {
  record: GeoRecord;
  mode: DashboardMode;
}

export function HeadlineKpis({ record, mode }: Props) {
  const n = record.nsr;
  const v = record.vulnerability;
  const isNsr = mode === "nsr";
  const isUpdate = mode === "vulnerability";

  const formatNumber = (val?: number) => (val ?? 0).toLocaleString();
  const formatPercent = (val?: number) => `${(val ?? 0).toFixed(1)}%`;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div className="bg-surface-light dark:bg-surface-dark border border-line-light dark:border-line-dark rounded-xl p-4 shadow-card">
        <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-onDarkMuted mb-1">
          {isNsr ? "Registered Households" : "Target Households"}
        </div>
        <div className="text-2xl font-black text-brand-600 dark:text-brand-400">
          {formatNumber(
            isUpdate ? (record.update?.updated_hh ?? 0) : n.total_households,
          )}
        </div>
        <div className="text-[10px] text-ink-faint dark:text-ink-onDarkMuted mt-1">
          {record.level === "national" || !record.level
            ? "ALL MDP STATES"
            : `${record.level.toUpperCase()}: ${record.state || record.lga || record.ward || ""}`}
        </div>
      </div>

      <div className="bg-surface-light dark:bg-surface-dark border border-line-light dark:border-line-dark rounded-xl p-4 shadow-card">
        <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-onDarkMuted mb-1">
          Total Population
        </div>
        <div className="text-2xl font-black text-ink-primary dark:text-ink-onDark">
          {formatNumber(n.total_individuals)}
        </div>
        <div className="text-[10px] text-ink-faint dark:text-ink-onDarkMuted mt-1">
          {formatNumber(n.children_under18)} children (0-17)
        </div>
      </div>

      <div className="bg-surface-light dark:bg-surface-dark border border-line-light dark:border-line-dark rounded-xl p-4 shadow-card">
        <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-onDarkMuted mb-1">
          {isNsr ? "NIN Verification Rate" : "Deprivation Rate"}
        </div>
        <div className="text-2xl font-black text-status-info">
          {formatPercent(n.nin_verification_rate ?? 0)}
        </div>
        <div className="text-[10px] text-ink-faint dark:text-ink-onDarkMuted mt-1">
          {`${formatNumber(n.nin_verified ?? 0)} of ${formatNumber(n.nin_eligible_adults ?? n.total_individuals)} adults`}
        </div>
      </div>

      <div className="bg-surface-light dark:bg-surface-dark border border-line-light dark:border-line-dark rounded-xl p-4 shadow-card">
        <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-onDarkMuted mb-1">
          {isNsr ? "Poorest Households" : "Vulnerability Index"}
        </div>
        <div className="text-2xl font-black text-status-warning">
          {isNsr
            ? formatNumber(v?.poorest_households ?? 0)
            : (v?.vulnerability_index ?? 0).toFixed(1)}
        </div>
        <div className="text-[10px] text-ink-faint dark:text-ink-onDarkMuted mt-1">
          {isNsr
            ? `${formatPercent(v?.poorest_pct ?? 0)} in poorest 3 deciles`
            : `Mean PMT: ${(v?.pmt_mean ?? 0).toFixed(2)}`}
        </div>
      </div>
    </div>
  );
}

export default HeadlineKpis;
