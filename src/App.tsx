import React, { useState, useEffect, useMemo, useCallback } from "react";
import { loadAllData } from "./lib/loadData";
import type {
  DashboardData,
  DomainId,
  GeoLevel,
  GeoRecord,
  DrilldownPath,
} from "./lib/types";

import { TopBar } from "./components/TopBar";
import { Breadcrumb } from "./components/Breadcrumb";
import { DomainNav } from "./components/DomainNav";
import { StateFilter } from "./components/StateFilter";

import { GlobalOverview } from "./components/domains/GlobalOverview";
import { CivilRegistration } from "./components/domains/CivilRegistration";
import { Education } from "./components/domains/Education";
import { HealthNutrition } from "./components/domains/HealthNutrition";
import { Disabilities } from "./components/domains/Disabilities";
import { LivelihoodsResilience } from "./components/domains/LivelihoodsResilience";

const PILOT_STATES = ["Abia", "Benue", "Oyo", "Sokoto"];

export const App: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeDomain, setActiveDomain] = useState<DomainId>("overview");
  const [isDark, setIsDark] = useState<boolean>(false);

  const [drilldown, setDrilldown] = useState<DrilldownPath>({
    level: "national",
    state: null,
    lga: null,
    ward: null,
    community: null,
  });

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    let mounted = true;
    loadAllData()
      .then((payload) => {
        if (mounted) {
          setData(payload);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err?.message || "Error loading dashboard data");
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const normU = (str: string | null | undefined): string =>
    str ? str.trim().toUpperCase() : "";

  const activeRecord: GeoRecord | null = useMemo(() => {
    if (!data) return null;

    if (drilldown.level === "national") {
      return data.national;
    }

    if (drilldown.level === "state" && drilldown.state) {
      const match = data.states.find(
        (s) =>
          normU(s.name) === normU(drilldown.state) ||
          normU(s.state) === normU(drilldown.state),
      );
      return match || data.national;
    }

    if (drilldown.level === "lga" && drilldown.lga) {
      const match = data.lgas.find(
        (l) =>
          (normU(l.name) === normU(drilldown.lga) ||
            normU(l.lga) === normU(drilldown.lga)) &&
          (!drilldown.state || normU(l.state) === normU(drilldown.state)),
      );
      return match || data.national;
    }

    if (drilldown.level === "ward" && drilldown.ward) {
      const match = data.wards.find(
        (w) =>
          (normU(w.name) === normU(drilldown.ward) ||
            normU(w.ward) === normU(drilldown.ward)) &&
          (!drilldown.lga || normU(w.lga) === normU(drilldown.lga)),
      );
      return match || data.national;
    }

    if (drilldown.level === "community" && drilldown.community) {
      const match = data.communities.find(
        (c) =>
          (normU(c.name) === normU(drilldown.community) ||
            normU(c.community) === normU(drilldown.community)) &&
          (!drilldown.lga || normU(c.lga) === normU(drilldown.lga)),
      );
      return match || data.national;
    }

    return data.national;
  }, [data, drilldown]);

  const filteredCommunities = useMemo(() => {
    if (!data) return [];
    if (!drilldown.state) return data.communities;

    return data.communities.filter((c) => {
      const stateMatch = normU(c.state) === normU(drilldown.state);
      if (!drilldown.lga) return stateMatch;
      const lgaMatch = normU(c.lga) === normU(drilldown.lga);
      if (!drilldown.ward) return stateMatch && lgaMatch;
      return stateMatch && lgaMatch && normU(c.ward) === normU(drilldown.ward);
    });
  }, [data, drilldown]);

  const handleStateSelect = useCallback((selectedState: string | null) => {
    if (!selectedState || selectedState === "all" || selectedState === "") {
      setDrilldown({
        level: "national",
        state: null,
        lga: null,
        ward: null,
        community: null,
      });
    } else {
      setDrilldown({
        level: "state",
        state: selectedState,
        lga: null,
        ward: null,
        community: null,
      });
    }
  }, []);

  const handleMapSelect = useCallback((name: string, level: GeoLevel) => {
    if (level === "state") {
      setDrilldown({
        level: "state",
        state: name,
        lga: null,
        ward: null,
        community: null,
      });
    } else if (level === "lga") {
      setDrilldown((prev) => ({
        ...prev,
        level: "lga",
        lga: name,
        ward: null,
        community: null,
      }));
    } else if (level === "ward") {
      setDrilldown((prev) => ({
        ...prev,
        level: "ward",
        ward: name,
        community: null,
      }));
    } else if (level === "community") {
      setDrilldown((prev) => ({
        ...prev,
        level: "community",
        community: name,
      }));
    }
  }, []);

  const handleBreadcrumbClick = useCallback((targetLevel: GeoLevel) => {
    if (targetLevel === "national") {
      setDrilldown({
        level: "national",
        state: null,
        lga: null,
        ward: null,
        community: null,
      });
    } else if (targetLevel === "state") {
      setDrilldown((prev) => ({
        ...prev,
        level: "state",
        lga: null,
        ward: null,
        community: null,
      }));
    } else if (targetLevel === "lga") {
      setDrilldown((prev) => ({
        ...prev,
        level: "lga",
        ward: null,
        community: null,
      }));
    } else if (targetLevel === "ward") {
      setDrilldown((prev) => ({
        ...prev,
        level: "ward",
        community: null,
      }));
    }
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="font-mono text-sm tracking-widest uppercase text-slate-400">
            Loading NASSCO MDP Aggregates...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data || !activeRecord) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-white p-6">
        <div className="max-w-md rounded-xl border border-red-800 bg-red-950/40 p-6 text-center">
          <h2 className="text-lg font-bold text-red-400 mb-2 uppercase tracking-wide">
            Data Load Error
          </h2>
          <p className="text-sm text-slate-300 mb-4">
            {error || "Failed to initialize dataset."}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg uppercase tracking-wider"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-200 ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50/70 text-slate-900"
      }`}
    >
      <TopBar meta={data.metadata} isDark={isDark} onToggleDark={toggleTheme} />

      <DomainNav activeDomain={activeDomain} onSelectDomain={setActiveDomain} />

      {/* Control Bar: Breadcrumbs & State Filter */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-100/60 dark:bg-slate-900/40 backdrop-blur">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-4">
          <Breadcrumb
            path={drilldown}
            onSelectLevel={handleBreadcrumbClick}
            isDark={isDark}
          />
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pilot Filter:
            </span>
            <StateFilter
              selectedState={drilldown.state || null}
              states={PILOT_STATES}
              onSelectState={handleStateSelect}
              isDark={isDark}
            />
          </div>
        </div>
      </div>

      {/* Main Domain Views */}
      <main className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeDomain === "overview" && (
          <GlobalOverview
            record={activeRecord}
            communities={filteredCommunities}
            onSelectLocation={handleMapSelect}
            isDark={isDark}
          />
        )}

        {activeDomain === "civil-registration" && (
          <CivilRegistration
            record={activeRecord}
            states={data.states}
            allCommunities={filteredCommunities}
            onSelectLocation={handleMapSelect}
            isDark={isDark}
          />
        )}

        {activeDomain === "education" && (
          <Education
            record={activeRecord}
            onSelectLocation={handleMapSelect}
            isDark={isDark}
          />
        )}

        {activeDomain === "health-nutrition" && (
          <HealthNutrition
            record={activeRecord}
            onSelectLocation={handleMapSelect}
            isDark={isDark}
          />
        )}

        {activeDomain === "disabilities" && (
          <Disabilities
            record={activeRecord}
            states={data.states}
            allCommunities={filteredCommunities}
            onSelectLocation={handleMapSelect}
            isDark={isDark}
          />
        )}

        {activeDomain === "livelihoods" && (
          <LivelihoodsResilience
            record={activeRecord}
            onSelectLocation={handleMapSelect}
            isDark={isDark}
          />
        )}
      </main>
    </div>
  );
};

export default App;
