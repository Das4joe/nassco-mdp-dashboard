import React, { useState, useEffect, useMemo } from "react";
import type { DomainId, GeoLevel, DrilldownPath, GeoRecord } from "./types";
import { loadAllData } from "./lib/loadData";
import Header from "./components/Header";
import GlobalOverview from "./components/domains/GlobalOverview";
import CivilRegistration from "./components/domains/CivilRegistration";
import Education from "./components/domains/Education";
import HealthNutrition from "./components/domains/HealthNutrition";
import Disabilities from "./components/domains/Disabilities";
import LivelihoodsResilience from "./components/domains/LivelihoodsResilience";
import { Sun, Moon, Database } from "lucide-react";

export const App: React.FC = () => {
  const [activeDomain, setActiveDomain] = useState<DomainId>("overview");
  const [drilldown, setDrilldown] = useState<DrilldownPath>({
    state: null,
    lga: null,
    community: null,
  });
  const [isDark, setIsDark] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  // Geo Data Store
  const [nationalRecord, setNationalRecord] = useState<GeoRecord | null>(null);
  const [states, setStates] = useState<GeoRecord[]>([]);
  const [lgas, setLgas] = useState<GeoRecord[]>([]);
  const [communities, setCommunities] = useState<GeoRecord[]>([]);

  useEffect(() => {
    async function initData() {
      try {
        setLoading(true);
        const data = await loadAllData();
        setNationalRecord(data.national);
        setStates(data.states);
        setLgas(data.lgas);
        setCommunities(data.communities);
      } catch (err) {
        console.error("Failed to load dataset:", err);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  const handleSelectLocation = (name: string, level: GeoLevel) => {
    if (level === "national" || name === "National") {
      setDrilldown({ state: null, lga: null, community: null });
    } else if (level === "state") {
      setDrilldown({ state: name, lga: null, community: null });
    } else if (level === "lga") {
      setDrilldown((prev) => ({ ...prev, lga: name, community: null }));
    } else if (level === "community") {
      setDrilldown((prev) => ({ ...prev, community: name }));
    }
  };

  const handleDrilldownChange = (path: DrilldownPath) => {
    setDrilldown(path);
  };

  // Resolve current active GeoRecord
  const activeRecord: GeoRecord = useMemo(() => {
    if (drilldown.community && communities.length > 0) {
      const match = communities.find(
        (c) =>
          (c.community_name || c.name || "").toLowerCase() ===
          drilldown.community?.toLowerCase(),
      );
      if (match) return match;
    }
    if (drilldown.lga && lgas.length > 0) {
      const match = lgas.find(
        (l) =>
          (l.lga_name || l.name || "").toLowerCase() ===
          drilldown.lga?.toLowerCase(),
      );
      if (match) return match;
    }
    if (drilldown.state && states.length > 0) {
      const match = states.find(
        (s) =>
          (s.state_name || s.name || "").toLowerCase() ===
          drilldown.state?.toLowerCase(),
      );
      if (match) return match;
    }
    return (
      nationalRecord || {
        id: "NGA",
        name: "Nigeria (4 Pilot States)",
        level: "national",
        total_households: 41512,
        total_individuals: 138676,
        male: 70312,
        female: 68364,
        children_0_17: 57688,
        youth_18_24: 19012,
        adults_25_59: 48750,
        elderly_60_plus: 13226,
      }
    );
  }, [drilldown, communities, lgas, states, nationalRecord]);

  const filteredCommunities = useMemo(() => {
    if (!drilldown.state) return communities;
    return communities.filter(
      (c) =>
        (c.state_name || "").toLowerCase() === drilldown.state?.toLowerCase(),
    );
  }, [communities, drilldown.state]);

  const domainNavItems: { id: DomainId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "civil_registration", label: "Civil Registration" },
    { id: "education", label: "Education" },
    { id: "health_nutrition", label: "Health & Nutrition" },
    { id: "disabilities", label: "Disabilities (PLWD)" },
    { id: "livelihoods", label: "Livelihoods & Resilience" },
  ];

  if (loading) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"}`}
      >
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
        <div className="text-base font-semibold tracking-wide">
          Loading NASSCO UNICEF MDP Dataset...
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-800"
      }`}
    >
      {/* Top Header */}
      <Header
        activeDomain={activeDomain}
        onSelectDomain={setActiveDomain}
        isDark={isDark}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Bar & Mode Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 border-slate-800">
          {/* Domain Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-inner">
            {domainNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveDomain(item.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeDomain === item.id ||
                  (item.id === "civil_registration" &&
                    activeDomain === "civil_reg") ||
                  (item.id === "livelihoods" &&
                    activeDomain === "livelihoods_resilience")
                    ? "bg-teal-500 text-slate-950 shadow-md font-bold"
                    : isDark
                      ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Controls: Theme & Microdata Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-medium">
              <Database className="w-3.5 h-3.5" />
              <span>138,676 NSR Records</span>
            </div>

            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-lg border transition-colors ${
                isDark
                  ? "bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
              title="Toggle Theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Active Domain View Content */}
        <div className="transition-opacity duration-300">
          {(activeDomain === "overview" || activeDomain === "demographics") && (
            <GlobalOverview
              record={activeRecord}
              currentRecord={activeRecord}
              drilldown={drilldown}
              selectedState={drilldown.state}
              selectedLga={drilldown.lga}
              states={states}
              communities={filteredCommunities}
              allCommunities={filteredCommunities}
              onSelectLocation={handleSelectLocation}
              onDrilldownChange={handleDrilldownChange}
              isDark={isDark}
            />
          )}

          {(activeDomain === "civil_registration" ||
            activeDomain === "civil_reg") && (
            <CivilRegistration
              record={activeRecord}
              currentRecord={activeRecord}
              drilldown={drilldown}
              selectedState={drilldown.state}
              selectedLga={drilldown.lga}
              states={states}
              communities={filteredCommunities}
              allCommunities={filteredCommunities}
              onSelectLocation={handleSelectLocation}
              onDrilldownChange={handleDrilldownChange}
              isDark={isDark}
            />
          )}

          {activeDomain === "education" && (
            <Education
              record={activeRecord}
              currentRecord={activeRecord}
              drilldown={drilldown}
              selectedState={drilldown.state}
              selectedLga={drilldown.lga}
              states={states}
              communities={filteredCommunities}
              allCommunities={filteredCommunities}
              onSelectLocation={handleSelectLocation}
              onDrilldownChange={handleDrilldownChange}
              isDark={isDark}
            />
          )}

          {activeDomain === "health_nutrition" && (
            <HealthNutrition
              record={activeRecord}
              currentRecord={activeRecord}
              drilldown={drilldown}
              selectedState={drilldown.state}
              selectedLga={drilldown.lga}
              states={states}
              communities={filteredCommunities}
              allCommunities={filteredCommunities}
              onSelectLocation={handleSelectLocation}
              onDrilldownChange={handleDrilldownChange}
              isDark={isDark}
            />
          )}

          {activeDomain === "disabilities" && (
            <Disabilities
              record={activeRecord}
              currentRecord={activeRecord}
              drilldown={drilldown}
              selectedState={drilldown.state}
              selectedLga={drilldown.lga}
              states={states}
              communities={filteredCommunities}
              allCommunities={filteredCommunities}
              onSelectLocation={handleSelectLocation}
              onDrilldownChange={handleDrilldownChange}
              isDark={isDark}
            />
          )}

          {(activeDomain === "livelihoods" ||
            activeDomain === "livelihoods_resilience") && (
            <LivelihoodsResilience
              record={activeRecord}
              currentRecord={activeRecord}
              drilldown={drilldown}
              selectedState={drilldown.state}
              selectedLga={drilldown.lga}
              states={states}
              communities={filteredCommunities}
              allCommunities={filteredCommunities}
              onSelectLocation={handleSelectLocation}
              onDrilldownChange={handleDrilldownChange}
              isDark={isDark}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`py-4 border-t text-center text-xs ${
          isDark
            ? "border-slate-800 text-slate-500 bg-slate-950"
            : "border-slate-200 text-slate-500 bg-white"
        }`}
      >
        Federal Republic of Nigeria — National Social Safety-Nets Coordinating
        Office (NASSCO) & UNICEF Section 3
      </footer>
    </div>
  );
};

export default App;
