import React from "react";
import type { GeoRecord, DrilldownPath } from "../../lib/types";
import type { DashboardData } from "../../lib/loadData";
import { ChartCard } from "./ChartCard";
import DrilldownMap from "../maps/DrilldownMap";

interface LivelihoodsResilienceProps {
  data: DashboardData;
  record: GeoRecord;
  path: DrilldownPath;
  onPathChange: (path: DrilldownPath) => void;
  stateFilter?: string;
}

export const LivelihoodsResilience: React.FC<LivelihoodsResilienceProps> = ({
  data,
  record,
  path,
  onPathChange,
  stateFilter,
}) => {
  const liv = record.extended.livelihoods_resilience_v2 ?? {
    shock_exposure: { shock_hh_count: 0 },
  };

  const youth = record.extended.youth ?? { employed: 0, unemployed: 0 };
  const femaleHeaded = record.extended.female_primary_respondent?.n || 0;
  const childrenRiskProne = record.extended.children_in_risk_hh?.n || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-line-light dark:border-line-dark">
        <div>
          <h2 className="text-xl font-bold text-ink-primary dark:text-ink-onDark">
            Livelihoods
          </h2>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted dark:text-ink-onDarkMuted mb-3">
          Indicator
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { l: "Female-Headed Households", v: femaleHeaded, c: "#9333EA" },
            { l: "Source of Livelihood (HHs)", v: 0, c: "#64748b", ph: true },
            { l: "Youth employment", v: youth.employed, c: "#059669" },
            { l: "Youth unemployment", v: youth.unemployed, c: "#DC2626" },
            {
              l: "Shock-Prone Households",
              v: liv.shock_exposure.shock_hh_count,
              c: "#D97706",
            },
            {
              l: "Children in Risk-Prone Households",
              v: childrenRiskProne,
              c: "#E67E22",
            },
            { l: "Household Coping mechanisms", v: 0, c: "#64748b", ph: true },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-surface-light dark:bg-surface-dark border border-line-light dark:border-line-dark rounded-lg p-3 shadow-sm flex flex-col justify-between"
            >
              <div className="text-[10px] uppercase font-bold text-ink-muted dark:text-ink-onDarkMuted mb-2 leading-tight">
                {item.l}
              </div>
              {item.ph ? (
                <div className="text-[10px] italic text-ink-faint">
                  Not isolated in export
                </div>
              ) : (
                <div className="text-xl font-black" style={{ color: item.c }}>
                  {item.v.toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-xs font-semibold text-ink-primary dark:text-ink-onDark">
          Shock Exposure Map
        </div>
        <DrilldownMap
          data={data}
          path={path}
          onPathChange={onPathChange}
          selectedStateFilter={stateFilter}
          metric="shocks"
          height={400}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ChartCard title="Children in Risk-Prone Households" height={280}>
          <div className="h-full flex items-center justify-center text-3xl font-black text-brand-600">
            {childrenRiskProne.toLocaleString()}
          </div>
        </ChartCard>
        <ChartCard title="Female-headed households (shock prone)" height={280}>
          <div className="h-full flex items-center justify-center p-6 text-center text-xs text-ink-muted italic border-2 border-dashed border-line-light dark:border-line-dark rounded-xl bg-surface-page/50">
            Cross-tabulation (Female Headed × Shock Exposure) not captured in
            backend export.
          </div>
        </ChartCard>
        <ChartCard
          title="Households with disabilities (shock prone)"
          height={280}
        >
          <div className="h-full flex items-center justify-center p-6 text-center text-xs text-ink-muted italic border-2 border-dashed border-line-light dark:border-line-dark rounded-xl bg-surface-page/50">
            Cross-tabulation (Disabilities × Shock Exposure) not captured in
            backend export.
          </div>
        </ChartCard>
        <ChartCard
          title="Households with multiple vulnerable members"
          height={280}
        >
          <div className="h-full flex items-center justify-center p-6 text-center text-xs text-ink-muted italic border-2 border-dashed border-line-light dark:border-line-dark rounded-xl bg-surface-page/50">
            Indicator logic not captured in backend export.
          </div>
        </ChartCard>
        <ChartCard title="Large households" height={280}>
          <div className="h-full flex items-center justify-center p-6 text-center text-xs text-ink-muted italic border-2 border-dashed border-line-light dark:border-line-dark rounded-xl bg-surface-page/50">
            Indicator logic not captured in backend export.
          </div>
        </ChartCard>
      </div>
    </div>
  );
};
export default LivelihoodsResilience;
