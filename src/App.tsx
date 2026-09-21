import { useEffect, useState } from "react";
import TopBar from "./components/TopBar";
import ModeToggle from "./components/ModeToggle";
import HeadlineKpis from "./components/HeadlineKpis";
import StateComparisonRow from "./components/StateComparisonRow";
import Breadcrumb from "./components/Breadcrumb";
import InsightsSidebar from "./components/InsightsSidebar";
import DrilldownMap from "./components/maps/DrilldownMap";
import CommunityRankingPanel from "./components/CommunityRankingPanel";
import { DomainNav, type DomainKey } from "./components/DomainNav";
import { StateFilter } from "./components/StateFilter";
import { CivilRegistration } from "./components/domains/CivilRegistration";
import { Education } from "./components/domains/Education";
import { Health } from "./components/domains/Health";
import { Nutrition } from "./components/domains/Nutrition";
import { LivelihoodsResilience } from "./components/domains/LivelihoodsResilience";
import { loadAllData, type DashboardData } from "./lib/loadData";
import type { DashboardMode, DrilldownPath, GeoRecord } from "./lib/types";

const normU = (s?: string) => (s ?? "").trim().toUpperCase();
const normL = (s?: string) => (s ?? "").trim().toLowerCase();

export default function App() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<DashboardMode>("nsr");
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

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-page dark:bg-surface-darker">
        <div className="w-12 h-12 rounded-full bg-brand-600 animate-pulse" />
      </div>
    );
  if (error || !data)
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-page dark:bg-surface-darker">
        <div className="text-status-danger">{error}</div>
      </div>
    );

  const currentRecord: GeoRecord = path.community
    ? (data.communities.find(
        (r) =>
          normU(r.state) === normU(path.state) &&
          normL(r.lga) === normL(path.lga) &&
          normL(r.ward) === normL(path.ward) &&
          normL(r.community) === normL(path.community),
      ) ?? data.national)
    : path.ward
      ? (data.wards.find(
          (r) =>
            normU(r.state) === normU(path.state) &&
            normL(r.lga) === normL(path.lga) &&
            normL(r.ward) === normL(path.ward),
        ) ?? data.national)
      : path.lga
        ? (data.lgas.find(
            (r) =>
              normU(r.state) === normU(path.state) &&
              normL(r.lga) === normL(path.lga),
          ) ?? data.national)
        : path.state
          ? (data.states.find((s) => normU(s.state) === normU(path.state)) ??
            data.national)
          : data.national;

  const handleStateFilter = (state: string | null) => {
    if (!state) setPath({});
    else setPath({ state });
  };

  return (
    <div className="min-h-screen bg-surface-page dark:bg-surface-darker pb-12">
      {/* Sticky Top Bar & UNICEF Navigation */}
      <div className="sticky top-0 z-40 shadow-sm dark:shadow-slate-900/50">
        <TopBar
          meta={data.metadata}
          isDark={isDark}
          onToggleDark={() => setIsDark(!isDark)}
        />
        <DomainNav active={domain} onChange={setDomain} />
      </div>

      {/* 1. GLOBAL / OVERVIEW */}
      {domain === "overview" && (
        <main className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <ModeToggle mode={mode} onChange={setMode} />
            <StateFilter value={path.state} onChange={handleStateFilter} />
          </div>

          <div className="flex items-center justify-between">
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
          </div>

          <HeadlineKpis
            record={currentRecord}
            meta={data.metadata}
            mode={mode}
          />

          {!path.state && (
            <StateComparisonRow
              states={data.states}
              nationalNinRate={data.national.nsr.nin_verification_rate}
              mode={mode}
              activeState={path.state}
              onSelect={(state) => setPath({ state })}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div
              className="lg:col-span-2 rounded-xl border border-line-light dark:border-line-dark bg-surface-light dark:bg-surface-dark shadow-card overflow-hidden"
              style={{ height: 640 }}
            >
              <DrilldownMap
                data={data}
                path={path}
                mode={mode}
                isDark={isDark}
                onPathChange={setPath}
                metric="vulnerability"
              />
            </div>

            <div className="lg:col-span-1">
              <InsightsSidebar
                data={data}
                path={path}
                mode={mode}
                onDrilldown={(p) => setPath({ ...path, ...p })}
              />
            </div>
          </div>

          <div className="pt-4">
            <div className="mb-3">
              <div className="text-sm font-bold uppercase tracking-wide text-ink-muted dark:text-ink-onDarkMuted">
                UNICEF Community Selection
              </div>
              <div className="text-xs text-ink-faint dark:text-ink-onDarkMuted mt-0.5">
                Ranked using the official UNICEF Data Toolkit methodology.
                Download the Excel template for handover to field teams.
              </div>
            </div>
            <CommunityRankingPanel data={data} />
          </div>
        </main>
      )}

      {/* 2. DOMAIN SPECIFIC PAGES */}
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
              data={currentRecord}
              states={data.states}
              national={data.national}
              stateFilter={path.state ?? null}
            />
          )}

          {domain === "health" && (
            <Health
              data={currentRecord}
              states={data.states}
              national={data.national}
              stateFilter={path.state ?? null}
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
              data={currentRecord}
              states={data.states}
              national={data.national}
              stateFilter={path.state ?? null}
            />
          )}
        </main>
      )}
    </div>
  );
}
