import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, GeoJSON, useMap } from "react-leaflet";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { DashboardData } from "../../lib/loadData";
import type { DrilldownPath, GeoRecord } from "../../lib/types";

/* ──────────────────────────────────────────────
   Props — identical contract to what parents pass
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
   Constants & helpers
   ────────────────────────────────────────────── */

const MDP_STATES = ["ABIA", "BENUE", "OYO", "SOKOTO"];

/** Shared normaliser — used on BOTH GeoJSON properties and summary data names */
const norm = (s: string): string =>
  s
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ")
    .replace(/[.,;:'"()]/g, "");

/* ──────────────────────────────────────────────
   Module-level GeoJSON cache (fetch each file once)
   ────────────────────────────────────────────── */

const geoCache: Record<string, any> = {};

async function fetchGeo(url: string): Promise<any> {
  if (geoCache[url]) return geoCache[url];

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`);
  }

  const text = await res.text();
  const trimmed = text.trim();

  // Loud failure: if Vercel returned HTML instead of JSON, say so clearly
  if (
    trimmed.startsWith("<") ||
    trimmed.toLowerCase().startsWith("<!doctype")
  ) {
    throw new Error(
      `Got HTML instead of JSON from ${url}. ` +
        `The file may be missing or vercel.json is rewriting it to index.html.`,
    );
  }

  const parsed = JSON.parse(trimmed);
  geoCache[url] = parsed;
  return parsed;
}

/* ──────────────────────────────────────────────
   Metric extraction from real GeoRecord fields
   ────────────────────────────────────────────── */

function getMetricValue(
  record: GeoRecord | undefined,
  metric: string,
): number | null {
  if (!record) return null;

  const hh = record.nsr?.total_households ?? record.total_households ?? 0;
  const children = record.children_0_17 ?? record.nsr?.children_under18 ?? 0;

  switch (metric) {
    case "out_of_school": {
      const oos =
        record.extended?.education_v2?.oos_6_17?.oos ??
        record.education?.oos_6_17?.oos ??
        0;
      return children > 0 ? (oos / children) * 100 : null;
    }
    case "vulnerability": {
      const shock =
        record.extended?.livelihoods_resilience_v2?.shock_prone_hhs ??
        record.livelihoods?.shock_prone_hhs ??
        0;
      return hh > 0 ? (shock / hh) * 100 : null;
    }
    case "birth_cert": {
      const bc =
        record.extended?.civil_registration?.c_0_17_with_bc ??
        record.civil_registration?.c_0_17_with_bc ??
        0;
      return children > 0 ? (bc / children) * 100 : null;
    }
    case "nutrition": {
      const sam =
        record.extended?.nutrition_v2?.sam_children ??
        record.nutrition?.sam_children ??
        0;
      const mam =
        record.extended?.nutrition_v2?.mam_children ??
        record.nutrition?.mam_children ??
        0;
      return children > 0 ? ((sam + mam) / children) * 100 : null;
    }
    case "households":
      return hh;
    default:
      return hh > 0 ? hh : null;
  }
}

function getColor(val: number | null, metric: string, isDark: boolean): string {
  if (val === null) return isDark ? "#1e293b" : "#e2e8f0";
  if (metric === "households") {
    if (val > 10000) return "#065f46";
    if (val > 5000) return "#047857";
    if (val > 2000) return "#10b981";
    if (val > 500) return "#34d399";
    return "#6ee7b7";
  }
  if (val >= 40) return "#991b1b";
  if (val >= 30) return "#c2410c";
  if (val >= 20) return "#d97706";
  if (val >= 10) return "#059669";
  return "#10b981";
}

/* ──────────────────────────────────────────────
   Leaflet sub-components
   ────────────────────────────────────────────── */

function MapBoundsController({ geojson }: { geojson: any }) {
  const map = useMap();
  useEffect(() => {
    if (!geojson?.features?.length || !map) return;
    try {
      const layer = L.geoJSON(geojson);
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [20, 20],
          maxZoom: 11,
          animate: true,
        });
      }
    } catch {
      // bounds calculation failed — ignore
    }
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
   Main component
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
    val: string;
  } | null>(null);

  // ── Theme observer ──
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

  // ── Derived state ──
  const activeState = path.state || selectedStateFilter || stateFilter;

  const currentLevel = useMemo(() => {
    if (path.ward) return "ward";
    if (path.lga) return "lga";
    if (activeState) return "state";
    return "national";
  }, [path.ward, path.lga, activeState]);

  // ── Build lookup Maps from real summary data ──
  // These use the ACTUAL data from loadData.ts (data.states, data.lgas, data.wards)
  // NOT the phantom data.state_metrics / data.lga_metrics that didn't exist

  const stateLookup = useMemo(() => {
    const m = new Map<string, GeoRecord>();
    for (const r of data.states || []) {
      if (r.state) m.set(norm(r.state), r);
    }
    return m;
  }, [data.states]);

  const lgaLookup = useMemo(() => {
    const m = new Map<string, GeoRecord>();
    for (const r of data.lgas || []) {
      if (r.state && r.lga) m.set(`${norm(r.state)}|${norm(r.lga)}`, r);
    }
    return m;
  }, [data.lgas]);

  const wardLookup = useMemo(() => {
    const m = new Map<string, GeoRecord>();
    for (const r of data.wards || []) {
      if (r.state && r.lga && r.ward)
        m.set(`${norm(r.state)}|${norm(r.lga)}|${norm(r.ward)}`, r);
    }
    return m;
  }, [data.wards]);

  // ── Record lookup helper (used by style, tooltip, click) ──
  function getRecordForFeature(
    props: any,
    level: string,
    sMap: Map<string, GeoRecord>,
    lMap: Map<string, GeoRecord>,
    wMap: Map<string, GeoRecord>,
  ): GeoRecord | undefined {
    if (!props) return undefined;
    if (level === "national" || level === "state") {
      return sMap.get(norm(props.NAME_1 || ""));
    }
    if (level === "lga") {
      return lMap.get(
        `${norm(props.NAME_1 || "")}|${norm(props.NAME_2 || "")}`,
      );
    }
    if (level === "ward") {
      return wMap.get(
        `${norm(props.state || "")}|${norm(props.lga || "")}|${norm(props.ward || "")}`,
      );
    }
    return undefined;
  }

  const getRecord = (props: any): GeoRecord | undefined =>
    getRecordForFeature(
      props,
      currentLevel,
      stateLookup,
      lgaLookup,
      wardLookup,
    );

  // ── Fetch & process GeoJSON ──
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        let raw: any;

        // Fetch from /geojson/ (NOT /data/ — that was the primary bug)
        if (currentLevel === "national" || currentLevel === "state") {
          raw = await fetchGeo("/geojson/nigeria-states.json");
        } else if (currentLevel === "lga") {
          raw = await fetchGeo("/geojson/nigeria_lga.json");
        } else {
          raw = await fetchGeo("/geojson/nigeria_ward.json");
        }

        if (cancelled) return;

        // Convert TopoJSON → GeoJSON for the states file
        let geo: any = raw;
        if (raw.type === "Topology" && raw.objects) {
          const objKey = Object.keys(raw.objects)[0];
          if (objKey) {
            geo = feature(
              raw as Topology,
              raw.objects[objKey] as GeometryCollection,
            );
          }
        }

        if (!geo?.features?.length) {
          setError("Boundary file loaded but contains no features.");
          setLoading(false);
          return;
        }

        // ── Filter features by level ──
        let features = geo.features as any[];

        if (currentLevel === "national") {
          // Show ONLY the 4 MDP states; drop Water body and the other 33
          features = features.filter((f: any) => {
            const n = norm(f.properties?.NAME_1 || "");
            return MDP_STATES.includes(n);
          });
        } else if (currentLevel === "state") {
          // Show LGAs within the selected state
          const target = norm(activeState || "");
          features = features.filter((f: any) => {
            return norm(f.properties?.NAME_1 || "") === target;
          });
        } else if (currentLevel === "lga") {
          // Show wards within the selected state + LGA
          const tState = norm(activeState || "");
          const tLga = norm(path.lga || "");
          features = features.filter((f: any) => {
            return (
              norm(f.properties?.state || "") === tState &&
              norm(f.properties?.lga || "") === tLga
            );
          });
        } else if (currentLevel === "ward") {
          // Show the single selected ward
          const tState = norm(activeState || "");
          const tLga = norm(path.lga || "");
          const tWard = norm(path.ward || "");
          features = features.filter((f: any) => {
            return (
              norm(f.properties?.state || "") === tState &&
              norm(f.properties?.lga || "") === tLga &&
              norm(f.properties?.ward || "") === tWard
            );
          });
        }

        if (cancelled) return;

        // Diagnostic: log join quality
        if (features.length > 0) {
          const matchedCount = features.filter((f: any) =>
            getRecordForFeature(
              f.properties,
              currentLevel,
              stateLookup,
              lgaLookup,
              wardLookup,
            ),
          ).length;
          console.log(
            `[Map] ${currentLevel}: ${features.length} polygons, ${matchedCount} matched to survey data`,
          );
        }

        setGeoData({ type: "FeatureCollection", features });
        setLoading(false);
      } catch (err: any) {
        if (cancelled) return;
        console.error("[Map] Load error:", err);
        setError(err?.message || "Failed to load map boundaries");
        setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [
    currentLevel,
    activeState,
    path.lga,
    path.ward,
    stateLookup,
    lgaLookup,
    wardLookup,
  ]);

  const getFeatureName = (props: any): string => {
    if (!props) return "Unknown";
    if (currentLevel === "ward")
      return props.ward || props.NAME_3 || "Unknown Ward";
    if (currentLevel === "lga")
      return props.NAME_2 || props.lga || "Unknown LGA";
    return props.NAME_1 || props.state || "Unknown State";
  };

  // ── Navigation ──
  const handleNav = (newPath: DrilldownPath) => {
    if (onPathChange) onPathChange(newPath);
    else if (onNavigate) onNavigate(newPath);
  };

  // ── Leaflet style & interaction ──
  const styleFeature = (f: any) => {
    const record = getRecord(f.properties);
    const val = getMetricValue(record, metric);
    const hasData = !!record;
    return {
      fillColor: hasData
        ? getColor(val, metric, isDark)
        : isDark
          ? "#1e293b"
          : "#e2e8f0",
      weight: hasData ? 1.5 : 0.5,
      color: isDark ? "#475569" : "#94a3b8",
      fillOpacity: hasData ? 0.85 : 0.25,
    };
  };

  const onEachFeature = (f: any, layer: L.Layer) => {
    const name = getFeatureName(f.properties);
    const record = getRecord(f.properties);
    const val = getMetricValue(record, metric);

    const label =
      val !== null
        ? metric === "households"
          ? `${val.toLocaleString()} households`
          : `${val.toFixed(1)}%`
        : "No survey data";

    layer.bindTooltip(`${name}: ${label}`, {
      direction: "auto",
      className: "text-xs",
    });

    // Only MDP regions with data are clickable
    if (!record) return;

    layer.on({
      mouseover: (e: any) => {
        e.target.setStyle({ weight: 3, color: "#38bdf8", fillOpacity: 1 });
        e.target.bringToFront();
        setHoverInfo({ name, val: label });
      },
      mouseout: (e: any) => {
        e.target.setStyle(styleFeature(f));
        setHoverInfo(null);
      },
      click: () => {
        if (currentLevel === "national") {
          // Pass UPPERCASE name to match summary data
          handleNav({ state: norm(f.properties.NAME_1) });
        } else if (currentLevel === "state") {
          handleNav({
            state: norm(activeState || ""),
            lga: norm(f.properties.NAME_2),
          });
        } else if (currentLevel === "lga") {
          handleNav({
            state: norm(activeState || ""),
            lga: norm(path.lga || ""),
            ward: norm(f.properties.ward),
          });
        }
      },
    });
  };

  // ── Render ──
  const containerHeight = typeof height === "number" ? `${height}px` : height;
  const bgColor = isDark ? "#0f172a" : "#f8fafc";

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800"
      style={{ height: containerHeight, backgroundColor: bgColor }}
    >
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/80">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-slate-300 text-sm font-medium">
            Loading boundaries…
          </p>
        </div>
      )}

      {/* Error overlay — loud and visible, not silent */}
      {error && !loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/90 p-6">
          <p className="text-red-400 font-bold text-lg mb-2">⚠ Map Error</p>
          <p className="text-slate-300 text-sm text-center max-w-md">{error}</p>
          <p className="text-slate-500 text-xs mt-3 text-center">
            Check that the file exists in public/geojson/ and that vercel.json
            does not rewrite /geojson/* to index.html.
          </p>
        </div>
      )}

      {/* Leaflet map — no TileLayer, vector only */}
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

      {/* Hover info card */}
      {hoverInfo && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/90 border border-emerald-500/50 px-3 py-2 rounded-lg shadow-lg pointer-events-none backdrop-blur-sm">
          <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
            {currentLevel}
          </p>
          <h4 className="text-sm font-bold text-white">{hoverInfo.name}</h4>
          <p className="text-xs text-slate-200 mt-0.5">{hoverInfo.val}</p>
        </div>
      )}

      {/* Minimal legend */}
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
