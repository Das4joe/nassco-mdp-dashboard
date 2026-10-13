import { useEffect, useState } from "react";
import TopBar from "./components/TopBar";
import Breadcrumb from "./components/Breadcrumb";
import CommunityRankingPanel from "./components/CommunityRankingPanel";
import { DomainNav, type DomainKey } from "./components/DomainNav";
import { StateFilter } from "./components/StateFilter";
import GlobalOverview from "./components/domains/GlobalOverview";
import { CivilRegistration } from "./components/domains/CivilRegistration";
import { Education } from "./components/domains/Education";
import { Health } from "./components/domains/Health";
import { Nutrition } from "./components/domains/Nutrition";
import { LivelihoodsResilience } from "./components/domains/LivelihoodsResilience";
import { loadAllData, type DashboardData } from "./lib/loadData";
import type { DrilldownPath, GeoRecord } from "./lib/types";

const normU = (s?: string) => (s ?? "").trim().toUpperCase();
const normL = (s?: string) => (s ?? "").trim().toLowerCase();

export default function App() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [path, setPath] = useState<DrilldownPath>({});
  const [domain, setDomain] = useState<DomainKey>("overview");

  useEffect(() => {
    loadAllData()
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-page dark:bg-surface-darker">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
          <p className="text-sm text-gray-400">Loading NASSCO MDP Data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-page dark:bg-surface-darker">
        <div className="text-status-danger p-6 border border-red-800 rounded-xl bg-red-950/20 text-center">
          <h3 className="font-bold text-lg mb-2">
            Failed to Load Dashboard Data
          </h3>
          <p className="text-sm">{error || "Data payload unavailable."}</p>
        </div>
      </div>
    );
  }

  // Safely locate current GeoRecord with safe fallbacks
  const currentRecord: GeoRecord =
    (path.community
      ? data.communities.find(
          (r) =>
            normU(r.state) === normU(path.state) &&
            normL(r.lga) === normL(path.lga) &&
            normL(r.ward) === normL(path.ward) &&
            normL(r.community) === normL(path.community),
        )
      : path.ward
        ? data.wards.find(
            (r) =>
              normU(r.state) === normU(path.state) &&
              normL(r.lga) === normL(path.lga) &&
              normL(r.ward) === normL(path.ward),
          )
        : path.lga
          ? data.lgas.find(
              (r) =>
                normU(r.state) === normU(path.state) &&
                normL(r.lga) === normL(path.lga),
            )
          : path.state
            ? data.states.find((s) => normU(s.state) === normU(path.state))
            : data.national) ?? data.national;

  const handleStateFilter = (state: string | null) => {
    if (!state) setPath({});
    else setPath({ state });
  };

  return (
    <div className="min-h-screen bg-surface-page dark:bg-surface-darker pb-12">
      <div className="sticky top-0 z-40 shadow-sm dark:shadow-slate-900/50">
        <TopBar
          meta={data.metadata}
          isDark={isDark}
          onToggleDark={() => setIsDark(!isDark)}
        />
        <DomainNav active={domain} onChange={setDomain} />
      </div>

      {domain === "overview" && (
        <main className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <Breadcrumb
              path={path}
              onNavigate={(level) => {
                if (level === "national") setPath({});
                else if (level === "state") setPath({ state: path.state });
                else if (level === "lga")
                  setPath({ state: path.state, lga: path.lga });
                else if (level === "ward")
                  setPath({
                    state: path.state,
                    lga: path.lga,
                    ward: path.ward,
                  });
              }}
            />
            <StateFilter value={path.state} onChange={handleStateFilter} />
          </div>

          {/* Render Modular Global Overview Component */}
          <GlobalOverview
            data={data}
            record={currentRecord}
            path={path}
            onPathChange={setPath}
            stateFilter={path.state}
          />

          <div className="pt-4">
            <CommunityRankingPanel
              data={data}
              selectedStateFilter={path.state}
            />
          </div>
        </main>
      )}

      {domain !== "overview" && (
        <main className="max-w-[1600px] mx-auto px-4 md:px-6 pt-4 pb-8 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <Breadcrumb
              path={path}
              onNavigate={(level) => {
                if (level === "national") setPath({});
                else if (level === "state") setPath({ state: path.state });
                else if (level === "lga")
                  setPath({ state: path.state, lga: path.lga });
                else if (level === "ward")
                  setPath({
                    state: path.state,
                    lga: path.lga,
                    ward: path.ward,
                  });
              }}
            />
            <div className="flex items-center gap-3">
              <div className="text-xs text-ink-faint dark:text-ink-onDarkMuted">
                Viewing:{" "}
                <span className="font-semibold text-ink-muted dark:text-ink-onDark">
                  {path.community ??
                    path.ward ??
                    path.lga ??
                    path.state ??
                    "All 4 MDP States"}
                </span>
              </div>
              <StateFilter value={path.state} onChange={handleStateFilter} />
            </div>
          </div>

          {domain === "civil-registration" && (
            <CivilRegistration
              data={data}
              record={currentRecord}
              path={path}
              onPathChange={setPath}
              stateFilter={path.state}
            />
          )}
          {domain === "education" && (
            <Education
              data={data}
              record={currentRecord}
              path={path}
              onPathChange={setPath}
              stateFilter={path.state}
            />
          )}
          {domain === "health" && (
            <Health
              data={data}
              record={currentRecord}
              path={path}
              onPathChange={setPath}
              stateFilter={path.state}
            />
          )}
          {domain === "nutrition" && (
            <Nutrition
              data={data}
              record={currentRecord}
              path={path}
              onPathChange={setPath}
              stateFilter={path.state}
            />
          )}
          {domain === "livelihoods" && (
            <LivelihoodsResilience
              data={data}
              record={currentRecord}
              path={path}
              onPathChange={setPath}
              stateFilter={path.state}
            />
          )}
        </main>
      )}
    </div>
  );
}
