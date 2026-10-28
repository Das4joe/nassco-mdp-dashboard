import React, { useState, useEffect, useMemo, useRef } from "react";
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

export type MapDomain =
  | "overview"
  | "civil"
  | "education"
  | "health"
  | "nutrition"
  | "livelihoods";

export interface DrilldownMapProps {
  data: DashboardData;
  path: DrilldownPath;
  onNavigate?: (path: DrilldownPath) => void;
  onPathChange?: (path: DrilldownPath) => void;
  selectedStateFilter?: string;
  stateFilter?: string;
  metric?: string;
  domain?: MapDomain;
  mode?: string;
  isDark?: boolean;
  height?: number | string;
}

/* ──────────────────────────────────────────────
   Constants
   ────────────────────────────────────────────── */

const MDP_STATES = new Set(["ABIA", "BENUE", "OYO", "SOKOTO"]);

const ALIAS: Record<string, string> = {
  NASSARAWA: "NASARAWA",
  "FEDERAL CAPITAL TERRITORY": "FCT",
  FCT: "FCT",
};

/* ──────────────────────────────────────────────
   Null-safe normaliser (prevents trim crash)
   ────────────────────────────────────────────── */

const norm = (s?: string | null): string => {
  const v = (s ?? "")
    .toString()
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ")
    .replace(/[.,;:'"()]/g, "");
  return ALIAS[v] || v;
};

const fmt = (v: unknown): string => {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return "n/a";
  return Number(v).toLocaleString();
};

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
    throw new Error(
      `Got HTML instead of JSON from ${url}. Check vercel.json rewrite rules.`,
    );
  }

  const parsed = JSON.parse(trimmed);
  geoCache[url] = parsed;
  return parsed;
}

/* ──────────────────────────────────────────────
   Domain-specific hover rows (single source of truth)
   ────────────────────────────────────────────── */

function buildHoverRows(
  record: GeoRecord | undefined,
  domain: MapDomain,
): { label: string; val: string }[] {
  if (!record) return [{ label: "Status", val: "No Survey Data" }];

  const r = record as any;
  const ext = r.extended || {};
  const nsr = r.nsr || {};

  switch (domain) {
    case "civil": {
      const cr = ext.civil_registration || r.civil_registration || {};
      return [
        {
          label: "Children with Birth Certificate",
          val: fmt(cr.c_0_17_with_bc),
        },
        {
          label: "Children without Birth Certificate",
          val: fmt(cr.c_0_17_no_bc),
        },
        {
          label: "Children with Registered NIN",
          val: fmt(cr.c_0_17_with_nin),
        },
        {
          label: "Children without Registered NIN",
          val: fmt(cr.c_0_17_no_nin),
        },
      ];
    }
    case "health": {
      const hl = ext.health_v2 || r.health_nutrition || r.health_v2 || {};
      return [
        {
          label: "Children living in household with health insurance cover",
          val: fmt(
            hl.health_insurance_0_5_covered ?? hl.health_insurance_0_7_covered,
          ),
        },
        {
          label: "Children living in household with no health insurance cover",
          val: fmt(
            hl.health_insurance_0_5_not_covered ??
              hl.health_insurance_0_7_not_covered,
          ),
        },
      ];
    }
    case "nutrition": {
      const nu = ext.nutrition_v2 || r.nutrition || r.nutrition_v2 || {};
      return [
        { label: "SAM", val: fmt(nu.sam_children) },
        { label: "MAM", val: fmt(nu.mam_children) },
        { label: "NNS", val: fmt(nu.normal_children) },
      ];
    }
    case "education": {
      const ed = ext.education_v2 || r.education || {};
      return [
        {
          label: "Out-of-School Children",
          val: fmt(ed?.oos_6_17?.oos ?? r.oos_children),
        },
        {
          label: "Children with Disabilities",
          val: fmt(
            ed?.disabled_children?.oos ??
              r.children_with_disabilities ??
              r.children_plwd,
          ),
        },
      ];
    }
    case "livelihoods": {
      const lv =
        ext.livelihoods_resilience_v2 || r.livelihoods_resilience_v2 || {};
      return [
        {
          label: "Shock-prone HHs",
          val: fmt(lv.shock_prone_hhs ?? r.shock_prone_hhs),
        },
        {
          label: "Female-headed HHs",
          val: fmt(lv.female_headed_hhs ?? r.female_headed_hhs),
        },
        {
          label: "Total Households",
          val: fmt(nsr.total_households ?? r.total_households),
        },
      ];
    }
    case "overview":
    default:
      return [
        {
          label: "Total Households",
          val: fmt(nsr.total_households ?? r.total_households),
        },
        {
          label: "Total Individuals",
          val: fmt(nsr.total_individuals ?? r.total_individuals),
        },
        {
          label: "Male",
          val: fmt(nsr.total_male ?? r.total_male ?? r.males),
        },
        {
          label: "Female",
          val: fmt(nsr.total_female ?? r.total_female ?? r.females),
        },
      ];
  }
}

/* ──────────────────────────────────────────────
   Choropleth value (for colour intensity)
   ────────────────────────────────────────────── */

function getChoroplethValue(
  record: GeoRecord | undefined,
  domain: MapDomain,
): number | null {
  if (!record) return null;
  const r = record as any;
  const ext = r.extended || {};
  const nsr = r.nsr || {};
  const hh = Number(nsr.total_households ?? r.total_households ?? 0);
  const children = Number(r.children_0_17 ?? nsr.children_under18 ?? 0);

  switch (domain) {
    case "civil": {
      const cr = ext.civil_registration || r.civil_registration || {};
      const bc = Number(cr.c_0_17_with_bc ?? 0);
      return children > 0 ? (bc / children) * 100 : bc;
    }
    case "education": {
      const ed = ext.education_v2 || r.education || {};
      const oos = Number(ed?.oos_6_17?.oos ?? 0);
      return children > 0 ? (oos / children) * 100 : oos;
    }
    case "health": {
      const hl = ext.health_v2 || r.health_nutrition || {};
      return Number(
        hl.health_insurance_0_5_not_covered ??
          hl.health_insurance_0_7_not_covered ??
          0,
      );
    }
    case "nutrition": {
      const nu = ext.nutrition_v2 || r.nutrition || {};
      return Number(nu.sam_children ?? 0) + Number(nu.mam_children ?? 0);
    }
    case "livelihoods": {
      const lv = ext.livelihoods_resilience_v2 || {};
      const shock = Number(lv.shock_prone_hhs ?? 0);
      return hh > 0 ? (shock / hh) * 100 : shock;
    }
    case "overview":
    default:
      return hh > 0 ? hh : null;
  }
}

function getColor(
  val: number | null,
  domain: MapDomain,
  isDark: boolean,
  hasData: boolean,
): string {
  if (!hasData || val === null) return isDark ? "#1e293b" : "#e2e8f0";

  if (domain === "overview" || domain === "health" || domain === "nutrition") {
    if (val > 10000) return "#065f46";
    if (val > 5000) return "#047857";
    if (val > 2000) return "#10b981";
    if (val > 500) return "#34d399";
    if (val > 100) return "#6ee7b7";
    return "#a7f3d0";
  }

  if (val >= 40) return "#991b1b";
  if (val >= 30) return "#c2410c";
  if (val >= 20) return "#d97706";
  if (val >= 10) return "#059669";
  return "#10b981";
}

/* ──────────────────────────────────────────────
   Leaflet helpers
   ────────────────────────────────────────────── */

function MapBoundsController({ geojson }: { geojson: any }) {
  const map = useMap();
  useEffect(() => {
    if (!geojson?.features?.length || !map) return;
    try {
      const bounds = L.geoJSON(geojson).getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [24, 24],
          maxZoom: 11,
          animate: true,
        });
      }
    } catch {
      /* ignore invalid bounds */
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
   Main Component
   ────────────────────────────────────────────── */

export const DrilldownMap: React.FC<DrilldownMapProps> = ({
  data,
  path,
  onNavigate,
  onPathChange,
  selectedStateFilter,
  stateFilter,
  domain: domainProp,
  metric,
  height = 420,
}) => {
  const domain: MapDomain = useMemo(() => {
    if (domainProp) return domainProp;
    const m = (metric || "").toLowerCase();
    if (m.includes("birth") || m.includes("civil") || m.includes("nin"))
      return "civil";
    if (m.includes("out_of_school") || m.includes("education"))
      return "education";
    if (m.includes("health")) return "health";
    if (m.includes("nutrition") || m.includes("sam") || m.includes("mam"))
      return "nutrition";
    if (m.includes("livelihood") || m.includes("shock")) return "livelihoods";
    return "overview";
  }, [domainProp, metric]);

  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(true);
  const [hoverInfo, setHoverInfo] = useState<{
    name: string;
    level: string;
    data: { label: string; val: string }[];
  } | null>(null);

  const geoJsonRef = useRef<L.GeoJSON | null>(null);

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

  useEffect(() => {
    setHoverInfo(null);
    return () => setHoverInfo(null);
  }, [path.state, path.lga, path.ward, domain]);

  const activeState = path.state || selectedStateFilter || stateFilter;

  const currentLevel = useMemo(() => {
    if (path.ward) return "ward" as const;
    if (path.lga) return "lga" as const;
    if (activeState) return "state" as const;
    return "national" as const;
  }, [path.ward, path.lga, activeState]);

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

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setHoverInfo(null);

    const load = async () => {
      try {
        let raw: any;

        if (currentLevel === "national") {
          raw = await fetchGeo("/geojson/nigeria-states.json");
        } else if (currentLevel === "state") {
          raw = await fetchGeo("/geojson/nigeria_lga.json");
        } else {
          raw = await fetchGeo("/geojson/nigeria_ward.json");
        }

        if (cancelled) return;

        let geo: any = raw;
        if (raw.type === "Topology" && raw.objects) {
          const objKey = raw.objects.NGA_adm1
            ? "NGA_adm1"
            : Object.keys(raw.objects)[0];
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

        let features = geo.features as any[];

        if (currentLevel === "national") {
          features = features.filter(
            (f: any) => norm(f.properties?.NAME_1) !== "WATER BODY",
          );
        } else if (currentLevel === "state") {
          const target = norm(activeState);
          features = features.filter(
            (f: any) => norm(f.properties?.NAME_1) === target,
          );
        } else if (currentLevel === "lga" || currentLevel === "ward") {
          const tState = norm(activeState);
          const tLga = norm(path.lga);
          features = features.filter((f: any) => {
            const fs = norm(f.properties?.state || f.properties?.NAME_1);
            const fl = norm(f.properties?.lga || f.properties?.NAME_2);
            return fs === tState && fl === tLga;
          });
        }

        if (cancelled) return;

        if (import.meta.env.DEV) {
          let matched = 0;
          const unmatched: string[] = [];
          for (const f of features) {
            const p = f.properties || {};
            let rec: GeoRecord | undefined;
            if (currentLevel === "national") {
              rec = stateLookup.get(norm(p.NAME_1));
              if (!rec && MDP_STATES.has(norm(p.NAME_1)))
                unmatched.push(p.NAME_1);
            } else if (currentLevel === "state") {
              rec = lgaLookup.get(`${norm(p.NAME_1)}|${norm(p.NAME_2)}`);
              if (!rec) unmatched.push(p.NAME_2 || "?");
            } else {
              rec = wardLookup.get(
                `${norm(p.state || p.NAME_1)}|${norm(p.lga || p.NAME_2)}|${norm(p.ward || p.NAME_3)}`,
              );
              if (!rec) unmatched.push(p.ward || p.NAME_3 || "?");
            }
            if (rec) matched++;
          }
          console.log(
            `[Map] level=${currentLevel} polygons=${features.length} matched=${matched} unmatched=${unmatched.length}`,
            unmatched.slice(0, 12),
          );
        }

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
  }, [
    currentLevel,
    activeState,
    path.lga,
    path.ward,
    stateLookup,
    lgaLookup,
    wardLookup,
  ]);

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
    return wardLookup.get(
      `${norm(props.state || props.NAME_1)}|${norm(props.lga || props.NAME_2)}|${norm(props.ward || props.NAME_3)}`,
    );
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
    setHoverInfo(null);
    if (onPathChange) onPathChange(newPath);
    else if (onNavigate) onNavigate(newPath);
  };

  const styleFeature = (f: any) => {
    const record = getRecordForFeature(f.properties, currentLevel);

    if (
      currentLevel === "national" &&
      !MDP_STATES.has(norm(f.properties?.NAME_1))
    ) {
      return {
        fillColor: isDark ? "#1e293b" : "#e2e8f0",
        weight: 0.6,
        color: isDark ? "#334155" : "#94a3b8",
        fillOpacity: 0.35,
      };
    }

    const val = getChoroplethValue(record, domain);
    return {
      fillColor: getColor(val, domain, isDark, !!record),
      weight: record ? 1.5 : 0.8,
      color: isDark ? "#475569" : "#94a3b8",
      fillOpacity: record ? 0.85 : 0.25,
    };
  };

  const onEachFeature = (f: any, layer: L.Layer) => {
    const name = getFeatureName(f.properties);
    const record = getRecordForFeature(f.properties, currentLevel);
    const isMdp =
      currentLevel !== "national" || MDP_STATES.has(norm(f.properties?.NAME_1));

    if (currentLevel === "national" && !isMdp) {
      layer.on({
        mouseover: () => {
          setHoverInfo({
            name,
            level: "NO DATA",
            data: [{ label: "Status", val: "No survey data" }],
          });
        },
        mouseout: () => setHoverInfo(null),
      });
      return;
    }

    if (!record) {
      layer.on({
        mouseover: () => {
          setHoverInfo({
            name,
            level: currentLevel.toUpperCase(),
            data: [{ label: "Status", val: "No Survey Data" }],
          });
        },
        mouseout: (e: any) => {
          setHoverInfo(null);
          if (geoJsonRef.current) {
            try {
              geoJsonRef.current.resetStyle(e.target);
            } catch {
              e.target.setStyle(styleFeature(f));
            }
          } else {
            e.target.setStyle(styleFeature(f));
          }
        },
      });
      return;
    }

    layer.on({
      mouseover: (e: any) => {
        e.target.setStyle({
          weight: 3,
          color: "#38bdf8",
          fillOpacity: 1,
        });
        if (e.target.bringToFront) e.target.bringToFront();
        setHoverInfo({
          name,
          level: currentLevel.toUpperCase(),
          data: buildHoverRows(record, domain),
        });
      },
      mouseout: (e: any) => {
        setHoverInfo(null);
        if (geoJsonRef.current) {
          try {
            geoJsonRef.current.resetStyle(e.target);
          } catch {
            e.target.setStyle(styleFeature(f));
          }
        } else {
          e.target.setStyle(styleFeature(f));
        }
      },
      click: () => {
        setHoverInfo(null);
        if (currentLevel === "national") {
          const st = (record as any).state || f.properties.NAME_1;
          handleNav({ state: st });
        } else if (currentLevel === "state") {
          const st =
            (record as any).state || activeState || f.properties.NAME_1;
          const lg = (record as any).lga || f.properties.NAME_2;
          handleNav({ state: st, lga: lg });
        } else if (currentLevel === "lga") {
          const st = (record as any).state || activeState;
          const lg = (record as any).lga || path.lga;
          const wd =
            (record as any).ward || f.properties.ward || f.properties.NAME_3;
          handleNav({ state: st, lga: lg, ward: wd });
        }
      },
    });
  };

  const containerHeight =
    typeof height === "number" ? `${height}px` : height || "420px";
  const bgColor = isDark ? "#0f172a" : "#f8fafc";

  const geoKey = [
    currentLevel,
    norm(activeState) || "nat",
    norm(path.lga) || "",
    norm(path.ward) || "",
    domain,
    isDark ? "d" : "l",
  ].join("|");

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800"
      style={{ height: containerHeight, backgroundColor: bgColor }}
      onMouseLeave={() => setHoverInfo(null)}
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
        attributionControl={false}
        style={{ width: "100%", height: "100%", backgroundColor: bgColor }}
      >
        <InvalidateOnMount />
        {geoData && (
          <>
            <GeoJSON
              key={geoKey}
              data={geoData}
              style={styleFeature}
              onEachFeature={onEachFeature}
              ref={(ref) => {
                geoJsonRef.current = ref;
              }}
            />
            <MapBoundsController geojson={geoData} />
          </>
        )}
      </MapContainer>

      {hoverInfo && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/95 border border-emerald-500/50 p-3 rounded-lg shadow-xl pointer-events-none backdrop-blur-md min-w-[220px] max-w-[320px]">
          <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider mb-1">
            {hoverInfo.level} LEVEL
          </p>
          <h4 className="text-sm font-bold text-white mb-2 border-b border-slate-700 pb-1">
            {hoverInfo.name}
          </h4>
          <div className="flex flex-col gap-1.5">
            {hoverInfo.data.map((d, i) => (
              <div key={i} className="flex justify-between items-start gap-3">
                <span className="text-xs text-slate-400 leading-tight max-w-[70%]">
                  {d.label}:
                </span>
                <span className="text-xs font-semibold text-slate-100 whitespace-nowrap">
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
