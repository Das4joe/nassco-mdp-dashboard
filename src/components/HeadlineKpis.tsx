import React from "react";
import { Users, User, ShieldCheck, Heart } from "lucide-react";
import type { GeoRecord, DashboardMode, DataMetadata } from "../lib/types";

interface HeadlineKpisProps {
  record: GeoRecord;
  meta?: DataMetadata;
  mode?: DashboardMode;
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

function formatPercent(pct: number): string {
  return `${pct.toFixed(1)}%`;
}

export const HeadlineKpis: React.FC<HeadlineKpisProps> = ({
  record,
  mode = "nsr",
}) => {
  const n = record.nsr;
  const v = record.vulnerability;
  const isUpdate = mode === "update";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. HOUSEHOLDS */}
      <div className="bg-surface-light dark:bg-surface-dark border border-line-light dark:border-line-dark rounded-xl p-4 shadow-card flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-ink-onDarkMuted">
            {isUpdate ? "Updated HHs" : "Households"}
          </span>
          <Users className="text-brand-600 dark:text-brand-400" size={18} />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-ink-primary dark:text-ink-onDark">
            {formatNumber(
              isUpdate ? (record.update?.updated_hh ?? 0) : n.total_households,
            )}
          </div>
          <p className="text-[11px] text-ink-muted dark:text-ink-onDarkMuted mt-0.5">
            {record.level === "national"
              ? "All 4 MDP States"
              : `${record.level.toUpperCase()}: ${record.state || record.lga || record.ward || ""}`}
          </p>
        </div>
      </div>

      {/* 2. INDIVIDUALS */}
      <div className="bg-surface-light dark:bg-surface-dark border border-line-light dark:border-line-dark rounded-xl p-4 shadow-card flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-ink-onDarkMuted">
            Individuals
          </span>
          <User className="text-brand-600 dark:text-brand-400" size={18} />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-ink-primary dark:text-ink-onDark">
            {formatNumber(n.total_individuals)}
          </div>
          <p className="text-[11px] text-ink-muted dark:text-ink-onDarkMuted mt-0.5">
            Avg{" "}
            {(n.total_individuals / Math.max(1, n.total_households)).toFixed(1)}{" "}
            per HH
          </p>
        </div>
      </div>

      {/* 3. NIN VERIFIED */}
      <div className="bg-surface-light dark:bg-surface-dark border border-line-light dark:border-line-dark rounded-xl p-4 shadow-card flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-ink-onDarkMuted">
            NIN Verified
          </span>
          <ShieldCheck
            className="text-emerald-600 dark:text-emerald-400"
            size={18}
          />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatPercent(n.nin_verification_rate)}
          </div>
          <p className="text-[11px] text-ink-muted dark:text-ink-onDarkMuted mt-0.5">
            {`${formatNumber(n.nin_verified ?? 0)} of ${formatNumber(n.nin_eligible_adults ?? n.total_individuals)} adults`}
          </p>
        </div>
      </div>

      {/* 4. VULNERABLE HHS */}
      <div className="bg-surface-light dark:bg-surface-dark border border-line-light dark:border-line-dark rounded-xl p-4 shadow-card flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-ink-onDarkMuted">
            Vulnerable HHs
          </span>
          <Heart className="text-amber-600 dark:text-amber-400" size={18} />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {formatNumber(v.poorest_households)}
          </div>
          <p className="text-[11px] text-ink-muted dark:text-ink-onDarkMuted mt-0.5">
            {formatPercent(v.poorest_pct)} in poorest 3 deciles
          </p>
        </div>
      </div>

      {/* 5. PMT SCORE */}
      <div className="bg-surface-light dark:bg-surface-dark border border-line-light dark:border-line-dark rounded-xl p-4 shadow-card flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-ink-onDarkMuted">
            PMT Score (Mean)
          </span>
          <span className="text-xs font-bold text-brand-600">PMT</span>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-ink-primary dark:text-ink-onDark">
            {(v.pmt_mean ?? 0).toFixed(2)}
          </div>
          <p className="text-[11px] text-ink-muted dark:text-ink-onDarkMuted mt-0.5">
            Composite Poverty Index
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeadlineKpis;
