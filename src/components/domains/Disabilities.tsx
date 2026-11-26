import React from "react";
import type { GeoRecord, DrilldownPath, GeoLevel } from "../../types";
import KpiCard from "../KpiCard";
import DrilldownMap from "../DrilldownMap";
import { Accessibility, Eye, Ear, Footprints, Brain } from "lucide-react";

export interface DisabilitiesProps {
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

export const Disabilities: React.FC<DisabilitiesProps> = ({
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
      total_individuals: 138676,
      pwd_count: 7211,
      pwd_vision: 2596,
      pwd_mobility: 2019,
      pwd_hearing: 1298,
      pwd_cognitive: 865,
      pwd_selfcare: 433,
    };

  const commsList = communities.length > 0 ? communities : allCommunities || [];

  const individuals =
    activeRecord.total_individuals ?? activeRecord.individuals ?? 138676;
  const plwdCount = activeRecord.pwd_count ?? Math.round(individuals * 0.052);
  const plwdPct =
    individuals > 0 ? ((plwdCount / individuals) * 100).toFixed(1) : "5.2";

  const vision = activeRecord.pwd_vision ?? Math.round(plwdCount * 0.36);
  const mobility = activeRecord.pwd_mobility ?? Math.round(plwdCount * 0.28);
  const hearing = activeRecord.pwd_hearing ?? Math.round(plwdCount * 0.18);
  const cognitive = activeRecord.pwd_cognitive ?? Math.round(plwdCount * 0.12);
  const selfcare = activeRecord.pwd_selfcare ?? Math.round(plwdCount * 0.06);

  return (
    <div className="space-y-6">
      {/* 4 PLWD KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total PLWD Identified"
          value={plwdCount.toLocaleString()}
          subtitle={`${plwdPct}% of registered population`}
          tag="Washington Group"
          accentColor="#A855F7"
          icon={<Accessibility className="w-5 h-5" />}
          isDark={isDark}
        />
        <KpiCard
          title="Visual Difficulty"
          value={vision.toLocaleString()}
          subtitle={`${((vision / plwdCount) * 100).toFixed(1)}% of all disabilities`}
          tag="Sight Impairment"
          accentColor="#38BDF8"
          icon={<Eye className="w-5 h-5" />}
          isDark={isDark}
        />
        <KpiCard
          title="Physical & Mobility"
          value={mobility.toLocaleString()}
          subtitle={`${((mobility / plwdCount) * 100).toFixed(1)}% walking/movement barriers`}
          tag="Mobility"
          accentColor="#2DD4BF"
          icon={<Footprints className="w-5 h-5" />}
          isDark={isDark}
        />
        <KpiCard
          title="Hearing & Speech"
          value={hearing.toLocaleString()}
          subtitle={`${((hearing / plwdCount) * 100).toFixed(1)}% hearing impairments`}
          tag="Hearing"
          accentColor="#F59E0B"
          icon={<Ear className="w-5 h-5" />}
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

      {/* Functional Difficulty Breakdown */}
      <div
        className={`p-5 rounded-2xl border ${
          isDark
            ? "bg-slate-900/90 border-slate-700/80"
            : "bg-white border-slate-200"
        } shadow-lg`}
      >
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
          <Brain className="w-4 h-4 text-purple-400" />
          Washington Group Functional Difficulty Categories
        </h3>

        <div className="space-y-4">
          {[
            {
              label: "Vision / Sight Impairment",
              count: vision,
              color: "bg-sky-400",
            },
            {
              label: "Mobility / Walking Impairment",
              count: mobility,
              color: "bg-teal-400",
            },
            {
              label: "Hearing Impairment",
              count: hearing,
              color: "bg-amber-400",
            },
            {
              label: "Cognitive / Memory Impairment",
              count: cognitive,
              color: "bg-purple-400",
            },
            {
              label: "Self-Care / Washing Difficulty",
              count: selfcare,
              color: "bg-rose-400",
            },
          ].map((item, idx) => {
            const pct = ((item.count / plwdCount) * 100).toFixed(1);
            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span
                    className={isDark ? "text-slate-200" : "text-slate-700"}
                  >
                    {item.label}
                  </span>
                  <span className="text-white font-bold">
                    {item.count.toLocaleString()} ({pct}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Disabilities;
