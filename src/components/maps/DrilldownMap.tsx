import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, GeoJSON, useMap } from "react-leaflet";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { DashboardData } from "../../lib/loadData";
import type { DrilldownPath, GeoRecord } from "../../lib/types";

/* ──────────────────────────────────────────────
   Props
   ────────────────────────────────────────────── */

export interface DrilldownMapProps {
  data: DashboardData;
  path: DrilldownPath;
  onNavigate?: (path: DrilldownPath) => void;
  onPathChange?: (path: DrilldownPath) => void;
  selectedStateFilter?: string;
  stateFilter?: string;
  metric?: string;
  mode?: string;
  isDark?: boolean;
  height?: number | string;
}

/* ──────────────────────────────────────────────
   Safe Normaliser (Prevents the trim crash)
   ────────────────────────────────────────────── */

const norm = (s?: string): string =>
  (s || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ")
    .replace(/[.,;:'"()]/g, "");

/* ──────────────────────────────────────────────
   GeoJSON Cache
   ────────────────────────────────────────────── */

const geoCache: Record<string, any> = {};

async function fetchGeo(url: string): Promise<any> {
  if (geoCache[url]) return geoCache[url];

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);

  const text = await res.text();
  const trimmed = text.trim();

  if (
    trimmed.startsWith("<") ||
    trimmed.toLowerCase().startsWith("<!doctype")
  ) {
    throw new Error(`Got HTML instead of JSON from ${url}. Check vercel.json.`);
  }

  const parsed = JSON.parse(trimmed);
  geoCache[url] = parsed;
  return parsed;
}

/* ──────────────────────────────────────────────
   Smart Hover Data Builder (Context-Aware)
   ────────────────────────────────────────────── */

function buildHoverData(record: GeoRecord | undefined, metric: string) {
  if (!record) return [{ label: "Status", val: "No Survey Data" }];

  const format = (v?: number) => (v || 0).toLocaleString();

  // 1. Civil Registration Domain
  if (metric.includes("birth_cert") || metric.includes("civil")) {
    const cr = record.extended?.civil_registration || record.civil_registration;
    return [
      { label: "Children w/ BC", val: format(cr?.c_0_17_with_bc) },
      { label: "Children w/o BC", val: format(cr?.c_0_17_no_bc) },
      { label: "Children w/ NIN", val: format(cr?.c_0_17_with_nin) },
      { label: "Children w/o NIN", val: format(cr?.c_0_17_no_nin) },
    ];
  }

  // 2. Education Domain
  if (metric.includes("out_of_school") || metric.includes("education")) {
    const ed = record.extended?.education_v2 || record.education;
    return [
      { label: "Out-of-School Children", val: format(ed?.oos_6_17?.oos) },
      {
        label: "Children w/ Disabilities",
        val: format(
          record.children_with_disabilities || ed?.disabled_children?.oos,
        ),
      },
    ];
  }

  // 3. Health Domain
  if (metric.includes("health")) {
    const hl = record.extended?.health_v2 || record.health_nutrition;
    return [
      {
        label: "HHs w/ Health Insurance",
        val: format(
          hl?.health_insurance_0_5_covered || hl?.health_insurance_0_7_covered,
        ),
      },
      {
        label: "HHs w/o Health Insurance",
        val: format(
          hl?.health_insurance_0_5_not_covered ||
            hl?.health_insurance_0_7_not_covered,
        ),
      },
    ];
  }

  // 4. Nutrition Domain
  if (metric.includes("nutrition")) {
    const nu = record.extended?.nutrition_v2 || record.nutrition;
    return [
      { label: "Children with SAM", val: format(nu?.sam_children) },
      { label: "Children with MAM", val: format(nu?.mam_children) },
      { label: "Normal Nutrition (NNS)", val: format(nu?.normal_children) },
    ];
  }

  // 5. Global Overview / Livelihoods / Default
  return [
    {
      label: "Total Households",
      val: format(record.nsr?.total_households ?? record.total_households),
    },
    {
      label: "Total Individuals",
      val: format(record.nsr?.total_individuals ?? record.total_individuals),
    },
    { label: "Male", val: format(record.nsr?.total_male ?? record.males) },
    {
      label: "Female",
      val: format(record.nsr?.total_female ?? record.females),
    },
  ];
}

/* ──────────────────────────────────────────────
   Metric extraction for Choropleth Colors
   ────────────────────────────────────────────── */

function getMetricValue(
  record: GeoRecord | undefined,
  metric: string,
): number | null {
  if (!record) return null;
  const hh = record.nsr?.total_households ?? record.total_households ?? 0;
  const children = record.children_0_17 ?? record.nsr?.children_under18 ?? 0;

  if (metric.includes("out_of_school")) {
    const oos = record.extended?.education_v2?.oos_6_17?.oos ?? 0;
    return children > 0 ? (oos / children) * 100 : null;
  }
  if (metric.includes("vulnerability") || metric.includes("livelihood")) {
    const shock =
      record.extended?.livelihoods_resilience_v2?.shock_prone_hhs ?? 0;
    return hh > 0 ? (shock / hh) * 100 : null;
  }
  if (metric.includes("birth_cert") || metric.includes("civil")) {
    const bc = record.extended?.civil_registration?.c_0_17_with_bc ?? 0;
    return children > 0 ? (bc / children) * 100 : null;
  }
  if (metric.includes("nutrition")) {
    const sam = record.extended?.nutrition_v2?.sam_children ?? 0;
    const mam = record.extended?.nutrition_v2?.mam_children ?? 0;
    return children > 0 ? ((sam + mam) / children) * 100 : null;
  }
  return hh > 0 ? hh : null;
}

function getColor(val: number | null, metric: string, isDark: boolean): string {
  if (val === null) return isDark ? "#1e293b" : "#e2e8f0"; // Grey for non-MDP states
  if (metric === "households" || !metric.includes("_")) {
    if (val > 10000) return "#065f46";
    if (val > 5000) return "#047857";
    if (val > 2000) return "#10b981";
    if (val > 500) return "#34d399";
    return "#6ee7b7";
  }
  // Percentage based colors
  if (val >= 40) return "#991b1b";
  if (val >= 30) return "#c2410c";
  if (val >= 20) return "#d97706";
  if (val >= 10) return "#059669";
  return "#10b981";
}

/* ──────────────────────────────────────────────
   Leaflet Core
   ────────────────────────────────────────────── */

function MapBoundsController({ geojson }: { geojson: any }) {
  const map = useMap();
  useEffect(() => {
    if (!geojson?.features?.length || !map) return;
    try {
      map.fitBounds(L.geoJSON(geojson).getBounds(), {
        padding: [20, 20],
        maxZoom: 11,
        animate: true,
      });
    } catch {}
  }, [geojson, map]);
  return null;
}

function InvalidateOnMount() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

/* ──────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────── */

export const DrilldownMap: React.FC<DrilldownMapProps> = ({
  data,
  path,
  onNavigate,
  onPathChange,
  selectedStateFilter,
  stateFilter,
  metric = "vulnerability",
  height = 420,
}) => {
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(true);
  const [hoverInfo, setHoverInfo] = useState<{
    name: string;
    level: string;
    data: { label: string; val: string }[];
  } | null>(null);

  useEffect(() => {
    const update = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  const activeState = path.state || selectedStateFilter || stateFilter;

  // Compute what level we should be displaying
  const currentLevel = useMemo(() => {
    if (path.ward) return "ward";
    if (path.lga) return "lga";
    if (activeState) return "state";
    return "national";
  }, [path.ward, path.lga, activeState]);

  // Lookup maps
  const stateLookup = useMemo(() => {
    const m = new Map<string, GeoRecord>();
    for (const r of data.states || []) if (r.state) m.set(norm(r.state), r);
    return m;
  }, [data.states]);

  const lgaLookup = useMemo(() => {
    const m = new Map<string, GeoRecord>();
    for (const r of data.lgas || [])
      if (r.state && r.lga) m.set(`${norm(r.state)}|${norm(r.lga)}`, r);
    return m;
  }, [data.lgas]);

  const wardLookup = useMemo(() => {
    const m = new Map<string, GeoRecord>();
    for (const r of data.wards || [])
      if (r.state && r.lga && r.ward)
        m.set(`${norm(r.state)}|${norm(r.lga)}|${norm(r.ward)}`, r);
    return m;
  }, [data.wards]);

  // Fetch Logic (Correct Cascade)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        let raw: any;

        // 1. Determine which FILE to fetch based on current drilldown level
        if (currentLevel === "national") {
          raw = await fetchGeo("/geojson/nigeria-states.json");
        } else if (currentLevel === "state") {
          raw = await fetchGeo("/geojson/nigeria_lga.json");
        } else {
          raw = await fetchGeo("/geojson/nigeria_ward.json"); // LGA and Ward levels both show Wards
        }

        if (cancelled) return;

        let geo: any = raw;
        if (raw.type === "Topology" && raw.objects) {
          const objKey = Object.keys(raw.objects)[0];
          if (objKey)
            geo = feature(
              raw as Topology,
              raw.objects[objKey] as GeometryCollection,
            );
        }

        if (!geo?.features?.length) {
          setError("Boundary file loaded but contains no features.");
          return setLoading(false);
        }

        let features = geo.features as any[];

        // 2. Filter geometries correctly so only the target location's children show
        if (currentLevel === "national") {
          // Show all states across Nigeria, except the water body artifact
          features = features.filter(
            (f: any) => norm(f.properties?.NAME_1) !== "WATER BODY",
          );
        } else if (currentLevel === "state") {
          // We are in a state view -> show all LGAs for that state
          const target = norm(activeState);
          features = features.filter(
            (f: any) => norm(f.properties?.NAME_1) === target,
          );
        } else if (currentLevel === "lga") {
          // We are in an LGA view -> show all Wards for that state + LGA combination
          const tState = norm(activeState);
          const tLga = norm(path.lga);
          features = features.filter(
            (f: any) =>
              norm(f.properties?.state || f.properties?.NAME_1) === tState &&
              norm(f.properties?.lga || f.properties?.NAME_2) === tLga,
          );
        } else if (currentLevel === "ward") {
          // We are in a specific Ward -> show just that Ward
          const tState = norm(activeState);
          const tLga = norm(path.lga);
          const tWard = norm(path.ward);
          features = features.filter(
            (f: any) =>
              norm(f.properties?.state || f.properties?.NAME_1) === tState &&
              norm(f.properties?.lga || f.properties?.NAME_2) === tLga &&
              norm(f.properties?.ward || f.properties?.NAME_3) === tWard,
          );
        }

        if (cancelled) return;
        setGeoData({ type: "FeatureCollection", features });
        setLoading(false);
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message || "Failed to load map boundaries");
        setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [currentLevel, activeState, path.lga, path.ward]);

  function getRecordForFeature(
    props: any,
    level: string,
  ): GeoRecord | undefined {
    if (!props) return undefined;
    if (level === "national") {
      return stateLookup.get(norm(props.NAME_1));
    }
    if (level === "state") {
      return lgaLookup.get(`${norm(props.NAME_1)}|${norm(props.NAME_2)}`);
    }
    if (level === "lga" || level === "ward") {
      return wardLookup.get(
        `${norm(props.state || props.NAME_1)}|${norm(props.lga || props.NAME_2)}|${norm(props.ward || props.NAME_3)}`,
      );
    }
    return undefined;
  }

  const getFeatureName = (props: any): string => {
    if (!props) return "Unknown";
    if (currentLevel === "national")
      return props.NAME_1 || props.state || "Unknown State";
    if (currentLevel === "state")
      return props.NAME_2 || props.lga || "Unknown LGA";
    return props.ward || props.NAME_3 || "Unknown Ward";
  };

  const handleNav = (newPath: DrilldownPath) => {
    if (onPathChange) onPathChange(newPath);
    else if (onNavigate) onNavigate(newPath);
  };

  const styleFeature = (f: any) => {
    const record = getRecordForFeature(f.properties, currentLevel);
    const val = getMetricValue(record, metric);
    const hasData = !!record; // Only MDP regions have data records

    return {
      fillColor: getColor(val, metric, isDark),
      weight: hasData ? 1.5 : 0.5,
      color: isDark ? "#475569" : "#94a3b8",
      fillOpacity: hasData ? 0.85 : 0.2, // Grey out non-target states
    };
  };

  const onEachFeature = (f: any, layer: L.Layer) => {
    const name = getFeatureName(f.properties);
    const record = getRecordForFeature(f.properties, currentLevel);

    // Non-MDP areas (or areas lacking data) don't get click handlers
    if (!record) {
      layer.bindTooltip(`${name} (No Survey Data)`, {
        className: "text-xs text-slate-500",
        direction: "auto",
      });
      return;
    }

    layer.on({
      mouseover: (e: any) => {
        e.target.setStyle({ weight: 3, color: "#38bdf8", fillOpacity: 1 });
        e.target.bringToFront();
        setHoverInfo({
          name,
          level: currentLevel,
          data: buildHoverData(record, metric),
        });
      },
      mouseout: (e: any) => {
        e.target.setStyle(styleFeature(f));
        setHoverInfo(null);
      },
      click: () => {
        // Safe navigation that relies on actual rendered geometry properties
        if (currentLevel === "national") {
          handleNav({ state: norm(f.properties.NAME_1) });
        } else if (currentLevel === "state") {
          handleNav({
            state: norm(activeState),
            lga: norm(f.properties.NAME_2 || f.properties.lga),
          });
        } else if (currentLevel === "lga") {
          handleNav({
            state: norm(activeState),
            lga: norm(path.lga),
            ward: norm(f.properties.ward || f.properties.NAME_3),
          });
        }
      },
    });
  };

  const containerHeight = typeof height === "number" ? `${height}px` : height;
  const bgColor = isDark ? "#0f172a" : "#f8fafc";

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800"
      style={{ height: containerHeight, backgroundColor: bgColor }}
    >
      {loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/80">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-slate-300 text-sm font-medium">
            Loading boundaries…
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/90 p-6">
          <p className="text-red-400 font-bold text-lg mb-2">⚠ Map Error</p>
          <p className="text-slate-300 text-sm text-center max-w-md">{error}</p>
        </div>
      )}

      <MapContainer
        center={[9.082, 8.6753]}
        zoom={6}
        zoomControl={false}
        scrollWheelZoom={false}
        style={{ width: "100%", height: "100%", backgroundColor: bgColor }}
      >
        <InvalidateOnMount />
        {geoData && (
          <>
            <GeoJSON
              key={`${currentLevel}-${activeState || "nat"}-${path.lga || ""}-${path.ward || ""}-${isDark}`}
              data={geoData}
              style={styleFeature}
              onEachFeature={onEachFeature}
            />
            <MapBoundsController geojson={geoData} />
          </>
        )}
      </MapContainer>

      {/* Smart Context-Aware Overlay Tooltip */}
      {hoverInfo && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/95 border border-emerald-500/50 p-3 rounded-lg shadow-xl pointer-events-none backdrop-blur-md min-w-[200px]">
          <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider mb-1">
            {hoverInfo.level} LEVEL
          </p>
          <h4 className="text-sm font-bold text-white mb-2 border-b border-slate-700 pb-1">
            {hoverInfo.name}
          </h4>
          <div className="flex flex-col gap-1">
            {hoverInfo.data.map((d, i) => (
              <div key={i} className="flex justify-between items-center gap-4">
                <span className="text-xs text-slate-400">{d.label}:</span>
                <span className="text-xs font-semibold text-slate-100">
                  {d.val}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="absolute bottom-4 right-4 z-[1000] bg-slate-900/90 border border-slate-700 px-2.5 py-1.5 rounded text-[10px] text-slate-400 pointer-events-none backdrop-blur-sm flex items-center gap-3">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-2 rounded-sm bg-emerald-600" />
          MDP Region
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-2 rounded-sm bg-slate-700" />
          No Data
        </span>
      </div>
    </div>
  );
};

export default DrilldownMap;
