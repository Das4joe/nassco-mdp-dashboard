import type React from "react";
import { Users, Home, Baby, ShieldCheck, HeartHandshake } from "lucide-react";
import { KpiCard } from "./KpiCard";
import type { GeoRecord } from "../types";

interface HeadlineKpisProps {
  data?: GeoRecord;
  isDark?: boolean;
}

export const HeadlineKpis: React.FC<HeadlineKpisProps> = ({
  data,
  isDark = true,
}) => {
  const totalHh = data?.households ?? 41512;
  const totalInd = data?.individuals ?? 138676;
  const totalChildren = data?.children017 ?? 57688;
  const ninCoverage = data?.ninCoverage ?? 29.8;
  const femaleHhPct = data?.femaleHeadedHhPct ?? 18.4;
  const isUpdate = Boolean(data?.isUpdated);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
      <KpiCard
        title="Total Households"
        value={totalHh}
        tag={isUpdate ? "RECENT UPDATE" : "BASELINE"}
        accentColor="teal"
        isDark={isDark}
        icon={Home}
      />
      <KpiCard
        title="Total Individuals"
        value={totalInd.toLocaleString()}
        tag="ALL MEMBERS"
        accentColor="teal"
        isDark={isDark}
        icon={Users}
      />
      <KpiCard
        title="Children (0-17)"
        value={totalChildren.toLocaleString()}
        tag={`${totalInd > 0 ? ((totalChildren / totalInd) * 100).toFixed(1) : 0}% POP`}
        accentColor="teal"
        isDark={isDark}
        icon={Baby}
      />
      <KpiCard
        title="NIN Coverage"
        value={`${ninCoverage}%`}
        tag="ID COVERAGE"
        accentColor="teal"
        isDark={isDark}
        icon={ShieldCheck}
      />
      <KpiCard
        title="Female Headed HH"
        value={`${femaleHhPct}%`}
        tag="RESILIENCE"
        accentColor="teal"
        isDark={isDark}
        icon={HeartHandshake}
      />
    </div>
  );
};

export default HeadlineKpis;
