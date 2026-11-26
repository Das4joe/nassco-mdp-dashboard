import React from "react";
import type { GeoRecord, DrilldownPath, GeoLevel } from "../../types";
import KpiCard from "../KpiCard";
import DrilldownMap from "../DrilldownMap";
import {
  Briefcase,
  UserCheck,
  DollarSign,
  ShieldAlert,
  Sprout,
  AlertTriangle,
} from "lucide-react";

export interface LivelihoodsResilienceProps {
  record?: GeoRecord;
  currentRecord?: GeoRecord;
  drilldown?: DrilldownPath;
  selectedState?: string | null;
  selectedLga?: string | null;
  states?: GeoRecord[];
  communities?: GeoRecord[];
  allCommunities?: GeoRecord[];
  onSelectLocation?: (name: string, level: GeoLevel | any) => void;
  onDrilldownChange?: (path: DrilldownPath) => void;
  isDark?: boolean;
}

export const LivelihoodsResilience: React.FC<LivelihoodsResilienceProps> = ({
  record,
  currentRecord,
  drilldown = { state: null, lga: null, community: null },
  selectedState,
  selectedLga,
  states = [],
  communities = [],
  allCommunities,
  onSelectLocation,
  onDrilldownChange,
  isDark = true,
}) => {
  const activeRecord: GeoRecord = record ||
    currentRecord || {
      total_households: 41512,
      female_headed_hh: 7638,
      subsistence_farming_pct: 64.2,
      zero_productive_assets_pct: 48.6,
      emergency_coping_pct: 31.8,
      access_to_credit_pct: 12.4,
    };

  const commsList = communities.length > 0 ? communities : allCommunities || [];

  const households =
    activeRecord.total_households ?? activeRecord.households ?? 41512;

  const femaleHeadedCount =
    activeRecord.female_headed_hh ?? Math.round(households * 0.184);
  const femaleHeadedPct =
    households > 0
      ? ((femaleHeadedCount / households) * 100).toFixed(1)
      : "18.4";

  const subsistenceFarmingPct = activeRecord.subsistence_farming_pct ?? 64.2;
  const zeroProductiveAssetsPct =
    activeRecord.zero_productive_assets_pct ?? 48.6;
  const emergencyCopingPct = activeRecord.emergency_coping_pct ?? 31.8;
  const creditAccessPct = activeRecord.access_to_credit_pct ?? 12.4;

  return (
    <div className="space-y-6">
      {/* 5 Core Livelihoods KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Female-Headed HH"
          value={`${femaleHeadedPct}%`}
          subtitle={`${femaleHeadedCount.toLocaleString()} households`}
          tag="Vulnerability"
          accentColor="#EC4899"
          icon={<UserCheck className="w-5 h-5" />}
          isDark={isDark}
        />
        <KpiCard
          title="Subsistence Farming"
          value={`${subsistenceFarmingPct}%`}
          subtitle="Primary source of income"
          tag="Agri-Dependent"
          accentColor="#2DD4BF"
          icon={<Sprout className="w-5 h-5" />}
          isDark={isDark}
        />
        <KpiCard
          title="Zero Productive Assets"
          value={`${zeroProductiveAssetsPct}%`}
          subtitle="No machinery / livestock"
          tag="Asset Poverty"
          accentColor="#F59E0B"
          icon={<Briefcase className="w-5 h-5" />}
          isDark={isDark}
        />
        <KpiCard
          title="Emergency Coping"
          value={`${emergencyCopingPct}%`}
          subtitle="Selling productive assets"
          tag="Distress Strategy"
          accentColor="#F43F5E"
          icon={<ShieldAlert className="w-5 h-5" />}
          isDark={isDark}
        />
        <KpiCard
          title="Access to Credit"
          value={`${creditAccessPct}%`}
          subtitle="Formal / cooperative loans"
          tag="Financial Inclusion"
          accentColor="#38BDF8"
          icon={<DollarSign className="w-5 h-5" />}
          isDark={isDark}
        />
      </div>

      {/* Embedded Authentic Boundary Drilldown Map */}
      <div className="w-full">
        <DrilldownMap
          record={activeRecord}
          currentRecord={activeRecord}
          selectedState={selectedState || drilldown.state}
          selectedLga={selectedLga || drilldown.lga}
          drilldown={drilldown}
          states={states}
          communities={commsList}
          onSelectLocation={onSelectLocation}
          onDrilldownChange={onDrilldownChange}
          isDark={isDark}
        />
      </div>

      {/* Livelihood Resilience Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Household Income Sources */}
        <div
          className={`p-5 rounded-2xl border ${
            isDark
              ? "bg-slate-900/90 border-slate-700/80"
              : "bg-white border-slate-200"
          } shadow-lg`}
        >
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <Briefcase className="w-4 h-4 text-teal-400" />
            Primary Income Source Breakdown
          </h3>

          <div className="space-y-4">
            {[
              {
                label: "Subsistence Agriculture & Farming",
                pct: "64.2%",
                color: "bg-teal-400",
              },
              {
                label: "Informal Petty Trading & Vending",
                pct: "21.5%",
                color: "bg-sky-400",
              },
              {
                label: "Casual Day Labor & Services",
                pct: "8.7%",
                color: "bg-amber-400",
              },
              {
                label: "Formal Wage Employment",
                pct: "3.4%",
                color: "bg-purple-400",
              },
              {
                label: "Remittances & Transfers",
                pct: "2.2%",
                color: "bg-pink-400",
              },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span
                    className={isDark ? "text-slate-200" : "text-slate-700"}
                  >
                    {item.label}
                  </span>
                  <span className="text-white font-bold">{item.pct}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full`}
                    style={{ width: item.pct }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distress Coping Strategies */}
        <div
          className={`p-5 rounded-2xl border ${
            isDark
              ? "bg-slate-900/90 border-slate-700/80"
              : "bg-white border-slate-200"
          } shadow-lg`}
        >
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Household Distress Coping Strategies
          </h3>

          <div className="space-y-4">
            {[
              {
                label: "Selling productive equipment / land",
                pct: "31.8%",
                color: "bg-rose-500",
              },
              {
                label: "Withdrawing children from school",
                pct: "24.6%",
                color: "bg-orange-500",
              },
              {
                label: "Reducing number / size of daily meals",
                pct: "56.3%",
                color: "bg-amber-400",
              },
              {
                label: "Borrowing food or reliance on help",
                pct: "42.1%",
                color: "bg-yellow-400",
              },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span
                    className={isDark ? "text-slate-200" : "text-slate-700"}
                  >
                    {item.label}
                  </span>
                  <span className="text-white font-bold">{item.pct}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full`}
                    style={{ width: item.pct }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivelihoodsResilience;
