import { useEffect, useState } from "react";
import TopBar from "./components/TopBar";
import Breadcrumb from "./components/Breadcrumb";
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
import type { DrilldownPath, GeoRecord } from "./lib/types";
import KpiCard from "./components/KpiCard";
import { ChartCard } from "./components/domains/ChartCard";
import { Users, User, Baby, Activity, Heart, ShieldCheck } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

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

  // --- Demographic Data Processing ---
  const rawPyramid = currentRecord.extended?.age_sex_pyramid ?? [];
  const targetBands = [
    "0-4",
    "5-9",
    "10-14",
    "15-19",
    "20-24",
    "0–4",
    "5–9",
    "10–14",
    "15–19",
    "20–24",
  ];

  // Transform to Diverging Data for True Pyramid (Males = negative, Females = positive)
  const pyramidData = rawPyramid
    .filter((b) => targetBands.includes(b.band))
    .map((b) => ({
      band: b.band,
      male: -(b.male || 0),
      female: b.female || 0,
      total: b.total || 0,
    }));

  const ageBands = currentRecord.extended?.age_bands_v2;
  const boys017 =
    ageBands?.["0-17"]?.male ?? currentRecord.nsr?.total_male ?? 0;
  const girls017 =
    ageBands?.["0-17"]?.female ?? currentRecord.nsr?.total_female ?? 0;
  const genderRatio = [
    { name: "Boys", value: boys017, color: "#0284C7" },
    { name: "Girls", value: girls017, color: "#E67E22" },
  ];

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

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted dark:text-ink-onDarkMuted mb-3">
              Indicator
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              <KpiCard
                label="Total Households Registered"
                value={currentRecord.nsr.total_households.toLocaleString()}
                icon={<Users size={16} />}
                accent="#075E54"
              />
              <KpiCard
                label="Total Individuals"
                value={currentRecord.nsr.total_individuals.toLocaleString()}
                icon={<User size={16} />}
                accent="#128C7E"
              />
              <KpiCard
                label="Children (0-17)"
                value={(ageBands?.["0-17"]?.total ?? 0).toLocaleString()}
                icon={<Baby size={16} />}
                accent="#E67E22"
              />
              <KpiCard
                label="Children (0-3)"
                value={(ageBands?.["0-3"]?.total ?? 0).toLocaleString()}
                icon={<Baby size={16} />}
                accent="#D97706"
              />
              <KpiCard
                label="Youth (18-24)"
                value={(ageBands?.["18-24"]?.total ?? 0).toLocaleString()}
                icon={<User size={16} />}
                accent="#059669"
              />
              <KpiCard
                label="PLWD"
                value={(
                  currentRecord.extended?.health_v2?.plwd_total ?? 0
                ).toLocaleString()}
                icon={<Activity size={16} />}
                accent="#DC2626"
              />
              <KpiCard
                label="Children with disabilities"
                value={(
                  currentRecord.extended?.health_v2?.children_plwd ?? 0
                ).toLocaleString()}
                icon={<Activity size={16} />}
                accent="#B91C1C"
              />
              <KpiCard
                label="Pregnant women"
                value={(
                  currentRecord.extended?.health_v2?.pregnant_total ?? 0
                ).toLocaleString()}
                icon={<Heart size={16} />}
                accent="#9333EA"
              />
              <KpiCard
                label="Lactating mothers"
                value={(
                  currentRecord.extended?.health_v2?.lactating_total ?? 0
                ).toLocaleString()}
                icon={<ShieldCheck size={16} />}
                accent="#0284C7"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            <div
              className="xl:col-span-1 rounded-xl border border-line-light dark:border-line-dark bg-surface-light dark:bg-surface-dark shadow-card overflow-hidden"
              style={{ height: 640 }}
            >
              <DrilldownMap
                data={data}
                path={path}
                mode="nsr"
                isDark={isDark}
                onPathChange={setPath}
                metric="vulnerability"
              />
            </div>

            <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <ChartCard
                title="Population pyramid [0-24] (boys & girls)"
                height={305}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={pyramidData}
                    layout="vertical"
                    margin={{ left: 10, right: 10, top: 10, bottom: 5 }}
                    stackOffset="sign"
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="band"
                      type="category"
                      width={50}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      formatter={(value: number) =>
                        Math.abs(value).toLocaleString()
                      }
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      wrapperStyle={{ fontSize: "11px" }}
                    />
                    <Bar
                      dataKey="male"
                      name="Boys"
                      fill="#0284C7"
                      stackId="a"
                      radius={[4, 0, 0, 4]}
                    />
                    <Bar
                      dataKey="female"
                      name="Girls"
                      fill="#E67E22"
                      stackId="a"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Gender ratio (boys and girls)" height={305}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderRatio}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {genderRatio.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => v.toLocaleString()}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      wrapperStyle={{ fontSize: "11px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Age ratio (0-24yrs)" height={305}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={pyramidData}
                    margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="band"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "#f1f5f9" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="total"
                      name="Total Population"
                      fill="#075E54"
                      radius={[4, 4, 0, 0]}
                      label={{
                        position: "top",
                        fill: "#64748b",
                        fontSize: 10,
                        formatter: (v: number) => v.toLocaleString(),
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title="Disabilities distribution amongst children"
                height={305}
              >
                <div className="h-full flex items-center justify-center p-6 text-center text-xs text-ink-muted italic border-2 border-dashed border-line-light dark:border-line-dark rounded-xl bg-surface-page/50 dark:bg-surface-darker/50">
                  Detailed cross-tabulation for child disabilities by age ranges
                  (0-24) is not captured in the current JSON expansion schema.
                </div>
              </ChartCard>
            </div>
          </div>

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
