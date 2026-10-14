import React from "react";
import type { GeoRecord, DrilldownPath } from "../../lib/types";
import type { DashboardData } from "../../lib/loadData";
import KpiCard from "../KpiCard";
import { ChartCard } from "./ChartCard";
import DrilldownMap from "../maps/DrilldownMap";
import { Briefcase, UserX, Home, AlertTriangle, Users } from "lucide-react";

interface Props {
  data: DashboardData;
  record: GeoRecord;
  path: DrilldownPath;
  onPathChange: (path: DrilldownPath) => void;
  stateFilter?: string;
}

export const LivelihoodsResilience: React.FC<Props> = ({
  data,
  record,
  path,
  onPathChange,
  stateFilter,
}) => {
  const rec = (record || {}) as any;
  const ext = rec.extended || {};
  const liv =
    ext.livelihoods_resilience_v2 || ext.livelihoods || rec.livelihoods || {};

  const femaleHeaded = Number(liv.female_headed_hhs ?? 0);
  const youthEmployed = Number(liv.youth_employed ?? 0);
  const youthUnemployed = Number(liv.youth_unemployed ?? 0);
  const shockProne = Number(liv.shock_prone_hhs ?? 0);
  const childrenInRisk = Number(liv.children_in_risk_hhs ?? 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted dark:text-ink-onDarkMuted mb-3">
          Livelihoods
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <KpiCard
            label="Female-Headed Households"
            value={femaleHeaded.toLocaleString()}
            icon={<Home size={16} />}
            accent="#7C3AED"
          />
          <KpiCard
            label="Youth Employment"
            value={youthEmployed.toLocaleString()}
            icon={<Briefcase size={16} />}
            accent="#059669"
          />
          <KpiCard
            label="Youth Unemployment"
            value={youthUnemployed.toLocaleString()}
            icon={<UserX size={16} />}
            accent="#DC2626"
          />
          <KpiCard
            label="Shock-Prone Households"
            value={shockProne.toLocaleString()}
            icon={<AlertTriangle size={16} />}
            accent="#D97706"
          />
          <KpiCard
            label="Children in Risk-Prone Households"
            value={childrenInRisk.toLocaleString()}
            icon={<Users size={16} />}
            accent="#B91C1C"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div
          className="xl:col-span-1 rounded-xl border border-line-light dark:border-line-dark bg-surface-light dark:bg-surface-dark shadow-card overflow-hidden"
          style={{ height: 420 }}
        >
          <DrilldownMap
            data={data}
            path={path}
            onPathChange={onPathChange}
            selectedStateFilter={stateFilter}
            metric="vulnerability"
          />
        </div>
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard title="Children in Risk-Prone Households" height={260}>
            <div className="h-full min-h-[180px] flex items-center justify-center text-3xl font-bold text-emerald-400">
              {childrenInRisk.toLocaleString()}
            </div>
          </ChartCard>
          <ChartCard
            title="Female-headed households (shock prone)"
            height={260}
          >
            <div className="h-full min-h-[180px] flex items-center justify-center p-6 text-center text-xs text-ink-muted italic border-2 border-dashed border-line-light dark:border-line-dark rounded-xl">
              Cross-tabulation of female-headed × shock-prone households is
              staged for the next data expansion.
            </div>
          </ChartCard>
          <ChartCard
            title="Households with disabilities (shock prone)"
            height={260}
          >
            <div className="h-full min-h-[180px] flex items-center justify-center p-6 text-center text-xs text-ink-muted italic border-2 border-dashed border-line-light dark:border-line-dark rounded-xl">
              Disability × shock-prone household cross-tab is not captured in
              the current survey wave.
            </div>
          </ChartCard>
          <ChartCard
            title="Households with multiple vulnerable members"
            height={260}
          >
            <div className="h-full min-h-[180px] flex items-center justify-center p-6 text-center text-xs text-ink-muted italic border-2 border-dashed border-line-light dark:border-line-dark rounded-xl">
              Multiple vulnerability member counts require additional
              household-level scoring in a future wave.
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default LivelihoodsResilience;
