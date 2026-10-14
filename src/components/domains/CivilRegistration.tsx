import React from "react";
import type { GeoRecord, DrilldownPath } from "../../lib/types";
import type { DashboardData } from "../../lib/loadData";
import KpiCard from "../KpiCard";
import { ChartCard } from "./ChartCard";
import DrilldownMap from "../maps/DrilldownMap";
import { FileCheck, FileX, IdCard, ShieldAlert } from "lucide-react";

interface Props {
  data: DashboardData;
  record: GeoRecord;
  path: DrilldownPath;
  onPathChange: (path: DrilldownPath) => void;
  stateFilter?: string;
}

export const CivilRegistration: React.FC<Props> = ({
  data,
  record,
  path,
  onPathChange,
  stateFilter,
}) => {
  const rec = (record || {}) as any;
  const ext = rec.extended || {};
  const civil = ext.civil_registration || rec.civil_registration || {};

  const c017WithBc = Number(civil.c_0_17_with_bc ?? 0);
  const c05WithBc = Number(civil.c_0_5_with_bc ?? 0);
  const c017NoBc = Number(civil.c_0_17_no_bc ?? 0);
  const c05NoBc = Number(civil.c_0_5_no_bc ?? 0);
  const c017WithNin = Number(civil.c_0_17_with_nin ?? 0);
  const c05WithNin = Number(civil.c_0_5_with_nin ?? 0);
  const c017NoBcNoNin = Number(civil.c_0_17_no_bc_no_nin ?? 0);
  const c05NoBcNoNin = Number(civil.c_0_5_no_bc_no_nin ?? 0);
  const c017BcNoNin = Number(civil.c_0_17_bc_no_nin ?? 0);
  const c05BcNoNin = Number(civil.c_0_5_bc_no_nin ?? 0);
  const c017NinNoBc = Number(civil.c_0_17_nin_no_bc ?? 0);
  const c05NinNoBc = Number(civil.c_0_5_nin_no_bc ?? 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted dark:text-ink-onDarkMuted mb-3">
          Civil Registration
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <KpiCard
            label="Children (0-17) with Birth Certificate"
            value={c017WithBc.toLocaleString()}
            icon={<FileCheck size={16} />}
            accent="#059669"
          />
          <KpiCard
            label="Children (0-5) with Birth Certificate"
            value={c05WithBc.toLocaleString()}
            icon={<FileCheck size={16} />}
            accent="#10B981"
          />
          <KpiCard
            label="Children (0-17) without Birth Certificate"
            value={c017NoBc.toLocaleString()}
            icon={<FileX size={16} />}
            accent="#DC2626"
          />
          <KpiCard
            label="Children (0-5) without Birth Certificate"
            value={c05NoBc.toLocaleString()}
            icon={<FileX size={16} />}
            accent="#EF4444"
          />
          <KpiCard
            label="Children (0-17) with Registered NIN"
            value={c017WithNin.toLocaleString()}
            icon={<IdCard size={16} />}
            accent="#0284C7"
          />
          <KpiCard
            label="Children (0-5) with Registered NIN"
            value={c05WithNin.toLocaleString()}
            icon={<IdCard size={16} />}
            accent="#0EA5E9"
          />
          <KpiCard
            label="Children (0-17) without Birth Certificate & NIN"
            value={c017NoBcNoNin.toLocaleString()}
            icon={<ShieldAlert size={16} />}
            accent="#B91C1C"
          />
          <KpiCard
            label="Children (0-5) without Birth Certificate & NIN"
            value={c05NoBcNoNin.toLocaleString()}
            icon={<ShieldAlert size={16} />}
            accent="#991B1B"
          />
          <KpiCard
            label="Children (0-17) with BC but no NIN"
            value={c017BcNoNin.toLocaleString()}
            icon={<FileCheck size={16} />}
            accent="#D97706"
          />
          <KpiCard
            label="Children (0-5) with BC but no NIN"
            value={c05BcNoNin.toLocaleString()}
            icon={<FileCheck size={16} />}
            accent="#F59E0B"
          />
          <KpiCard
            label="Children (0-17) with NIN but no BC"
            value={c017NinNoBc.toLocaleString()}
            icon={<IdCard size={16} />}
            accent="#7C3AED"
          />
          <KpiCard
            label="Children (0-5) with NIN but no BC"
            value={c05NinNoBc.toLocaleString()}
            icon={<IdCard size={16} />}
            accent="#8B5CF6"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div
          className="xl:col-span-1 rounded-xl border border-line-light dark:border-line-dark bg-surface-light dark:bg-surface-dark shadow-card overflow-hidden"
          style={{ height: 480 }}
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
          <ChartCard
            title="Birth certificate distribution by gender"
            height={280}
          >
            <div className="h-full flex items-center justify-center p-6 text-center text-xs text-ink-muted italic border-2 border-dashed border-line-light dark:border-line-dark rounded-xl">
              Gender-disaggregated birth certificate charts render when detailed
              gender cross-tabs are expanded in the next data wave.
            </div>
          </ChartCard>
          <ChartCard title="NIN distribution by gender" height={280}>
            <div className="h-full flex items-center justify-center p-6 text-center text-xs text-ink-muted italic border-2 border-dashed border-line-light dark:border-line-dark rounded-xl">
              Gender-disaggregated NIN charts render when detailed gender
              cross-tabs are expanded in the next data wave.
            </div>
          </ChartCard>
          <ChartCard
            title="Birth Certificate coverage (%) among children"
            height={280}
          >
            <div className="h-full flex items-center justify-center p-6 text-center text-xs text-ink-muted italic border-2 border-dashed border-line-light dark:border-line-dark rounded-xl">
              Percentage coverage charts require population denominators
              currently staged for the next schema expansion.
            </div>
          </ChartCard>
          <ChartCard title="NIN coverage (%) among children" height={280}>
            <div className="h-full flex items-center justify-center p-6 text-center text-xs text-ink-muted italic border-2 border-dashed border-line-light dark:border-line-dark rounded-xl">
              Percentage coverage charts require population denominators
              currently staged for the next schema expansion.
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default CivilRegistration;
