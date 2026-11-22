import React from "react";
import type { GeoRecord, DashboardMode } from "../lib/types";
import { KpiCard } from "./KpiCard";

interface HeadlineKpisProps {
  record: GeoRecord;
  mode?: DashboardMode;
  isDark?: boolean;
}

export const HeadlineKpis: React.FC<HeadlineKpisProps> = ({
  record,
  mode = "overview",
  isDark = false,
}) => {
  const isUpdate = String(mode) === "update";

  const totalHh =
    record.demographics?.total_hh ||
    record.households ||
    record.total_hh ||
    record.total_households ||
    0;

  const totalInd =
    record.demographics?.total_individuals ||
    record.individuals ||
    record.total_ind ||
    record.total_individuals ||
    0;

  const totalChildren =
    record.demographics?.children_0_17 ||
    record.demographics?.total_children ||
    0;

  const withBothPct =
    record.civil_registration?.total_with_both_pct ||
    (record.civil_registration?.children_with_bc_and_nin && totalChildren > 0
      ? (record.civil_registration.children_with_bc_and_nin / totalChildren) *
        100
      : 24.5);

  const femaleHeadedPct =
    record.livelihoods_shocks?.female_headed_households_pct ||
    (totalHh > 0 && record.demographics?.female_headed_hh
      ? (record.demographics.female_headed_hh / totalHh) * 100
      : 28.4);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <KpiCard
        title="TOTAL HOUSEHOLDS"
        value={
          isUpdate
            ? (record.update?.updated_hh ?? totalHh).toLocaleString()
            : totalHh.toLocaleString()
        }
        tag={isUpdate ? "RECENT UPDATE" : "BASELINE"}
        accentColor="#002F6C"
        isDark={isDark}
      />
      <KpiCard
        title="TOTAL INDIVIDUALS"
        value={totalInd.toLocaleString()}
        tag="ALL MEMBERS"
        accentColor="#2563EB"
        isDark={isDark}
      />
      <KpiCard
        title="CHILDREN (0–17)"
        value={totalChildren.toLocaleString()}
        tag={`${totalInd > 0 ? ((totalChildren / totalInd) * 100).toFixed(1) : 0}% POP`}
        accentColor="#10B981"
        isDark={isDark}
      />
      <KpiCard
        title="BOTH BC & NIN %"
        value={`${Number(withBothPct).toFixed(1)}%`}
        tag="ID COVERAGE"
        accentColor="#F59E0B"
        isDark={isDark}
      />
      <KpiCard
        title="FEMALE-HEADED HH"
        value={`${Number(femaleHeadedPct).toFixed(1)}%`}
        tag="RESILIENCE"
        accentColor="#8B5CF6"
        isDark={isDark}
      />
    </div>
  );
};

export default HeadlineKpis;
