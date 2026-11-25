import React from "react";
import type { GeoRecord, DrilldownPath, GeoLevel } from "../../types";
import KpiCard from "../KpiCard";
import DrilldownMap from "../DrilldownMap";
import {
  Users,
  Home,
  UserCheck,
  MapPin,
  Award,
  Layers,
  ArrowUpRight,
} from "lucide-react";

export interface GlobalOverviewProps {
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

export const GlobalOverview: React.FC<GlobalOverviewProps> = ({
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
      total_individuals: 138676,
      male: 70312,
      female: 68364,
      children_0_17: 57688,
      youth_18_24: 19012,
      adults_25_59: 48750,
      elderly_60_plus: 13226,
    };

  const commsList = communities.length > 0 ? communities : allCommunities || [];

  const households =
    activeRecord.total_households ?? activeRecord.households ?? 41512;
  const individuals =
    activeRecord.total_individuals ?? activeRecord.individuals ?? 138676;
  const male = activeRecord.male ?? 70312;
  const female = activeRecord.female ?? 68364;
  const femalePct =
    individuals > 0 ? ((female / individuals) * 100).toFixed(1) : "49.3";
  const avgHhSize =
    households > 0 ? (individuals / households).toFixed(1) : "3.3";

  // Age cohorts
  const children = activeRecord.children_0_17 ?? 57688;
  const youth = activeRecord.youth_18_24 ?? 19012;
  const adults = activeRecord.adults_25_59 ?? 48750;
  const elderly = activeRecord.elderly_60_plus ?? 13226;

  const childPct =
    individuals > 0 ? ((children / individuals) * 100).toFixed(1) : "41.6";
  const youthPct =
    individuals > 0 ? ((youth / individuals) * 100).toFixed(1) : "13.7";

  return (
    <div className="space-y-6">
      {/* 4 Core Demographic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Households"
          value={households.toLocaleString()}
          subtitle="Registered in Social Registry"
          tag="NSR Core"
          accentColor="#2DD4BF"
          icon={<Home className="w-5 h-5" />}
          isDark={isDark}
        />
        <KpiCard
          title="Total Population"
          value={individuals.toLocaleString()}
          subtitle={`Avg HH Size: ${avgHhSize} persons`}
          tag="Surveyed"
          accentColor="#38BDF8"
          icon={<Users className="w-5 h-5" />}
          isDark={isDark}
        />
        <KpiCard
          title="Children (0-17)"
          value={children.toLocaleString()}
          subtitle={`${childPct}% of total population`}
          tag="Child PMT"
          accentColor="#F59E0B"
          icon={<UserCheck className="w-5 h-5" />}
          isDark={isDark}
        />
        <KpiCard
          title="Youth (18-24)"
          value={youth.toLocaleString()}
          subtitle={`${youthPct}% adolescent & youth cohort`}
          tag="Productive Age"
          accentColor="#EC4899"
          icon={<Award className="w-5 h-5" />}
          isDark={isDark}
        />
      </div>

      {/* Main Vector Drilldown Map Section */}
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

      {/* Demographics & Age Pyramid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Population Cohort Breakdown */}
        <div
          className={`p-5 rounded-2xl border ${
            isDark
              ? "bg-slate-900/80 border-slate-800"
              : "bg-white border-slate-200"
          } shadow-lg`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-400" />
              Population Age Pyramid & Cohorts
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold">
              4 Pilot States
            </span>
          </div>

          <div className="space-y-4">
            {[
              {
                label: "Children (0–17 yrs)",
                count: children,
                pct: childPct,
                color: "bg-amber-400",
              },
              {
                label: "Youth (18–24 yrs)",
                count: youth,
                pct: youthPct,
                color: "bg-pink-500",
              },
              {
                label: "Adults (25–59 yrs)",
                count: adults,
                pct: ((adults / individuals) * 100).toFixed(1),
                color: "bg-teal-400",
              },
              {
                label: "Elderly (60+ yrs)",
                count: elderly,
                pct: ((elderly / individuals) * 100).toFixed(1),
                color: "bg-indigo-400",
              },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span
                    className={isDark ? "text-slate-300" : "text-slate-700"}
                  >
                    {item.label}
                  </span>
                  <span className="font-bold text-slate-200">
                    {item.count.toLocaleString()} ({item.pct}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Male:{" "}
              <strong className="text-sky-400">{male.toLocaleString()}</strong>
            </span>
            <span>
              Female:{" "}
              <strong className="text-rose-400">
                {female.toLocaleString()} ({femalePct}%)
              </strong>
            </span>
          </div>
        </div>

        {/* State Summary Cards */}
        <div
          className={`p-5 rounded-2xl border ${
            isDark
              ? "bg-slate-900/80 border-slate-800"
              : "bg-white border-slate-200"
          } shadow-lg`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-400" />
              Pilot State Coverage Summary
            </h3>
            <span className="text-xs text-slate-400">Target Geographies</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "Abia", hhs: "9,842", ind: "31,820", lgas: "8 LGAs" },
              { name: "Benue", hhs: "11,430", ind: "39,114", lgas: "7 LGAs" },
              { name: "Oyo", hhs: "10,120", ind: "33,640", lgas: "7 LGAs" },
              { name: "Sokoto", hhs: "10,120", ind: "34,102", lgas: "7 LGAs" },
            ].map((st, i) => (
              <button
                key={i}
                onClick={() =>
                  onSelectLocation && onSelectLocation(st.name, "state")
                }
                className={`p-3.5 rounded-xl text-left border transition-all ${
                  (selectedState || drilldown.state)?.toLowerCase() ===
                  st.name.toLowerCase()
                    ? "bg-teal-500/20 border-teal-500/60 shadow-lg shadow-teal-500/10"
                    : isDark
                      ? "bg-slate-800/60 border-slate-700/60 hover:bg-slate-800"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-teal-300">
                    {st.name}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="mt-2 text-xs text-slate-400">
                  <div>
                    HHs: <strong className="text-slate-200">{st.hhs}</strong>
                  </div>
                  <div>
                    Pop: <strong className="text-slate-200">{st.ind}</strong>
                  </div>
                  <div className="text-[11px] text-teal-400/90 mt-0.5">
                    {st.lgas}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalOverview;
