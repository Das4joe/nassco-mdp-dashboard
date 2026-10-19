import React, { useEffect, useState, useMemo, useCallback } from "react";
import { MapContainer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import * as topojson from "topojson-client";
import type { DashboardData } from "../../lib/loadData";
import type { DrilldownPath } from "../../lib/types";

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

const MDP_STATES = new Set(["ABIA", "BENUE", "OYO", "SOKOTO"]);

// --- Utility Functions ---

function normName(val: any): string {
  if (!val) return "";
  let s = String(val).trim();
  if (s.includes(".")) {
    const parts = s.split(".");
    s = parts[parts.length - 1].trim();
  }
  return s.toUpperCase().trim();
}

function getGeoStateName(props: any): string {
  return normName(
    props?.NAME_1 ||
      props?.state ||
      props?.STATE ||
      props?.admin1Name ||
      props?.NAME_0,
  );
}

function getGeoLgaName(props: any): string {
  return normName(
    props?.NAME_2 || props?.lga || props?.LGA || props?.admin2Name,
  );
}

function getGeoWardName(props: any): string {
  return normName(
    props?.NAME_3 || props?.ward || props?.WARD || props?.admin3Name,
  );
}

function useDarkMode(): boolean {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : true,
  );

  useEffect(() => {
    if (typeof document === "undefined") return;
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

// --- Robust Geo Data Loader ---

function useGeoData(initialData: any) {
  const [geo, setGeo] = useState<any>(initialData?.geo || null);
  const [loading, setLoading] = useState<boolean>(!initialData?.geo);

  useEffect(() => {
    if (geo?.states && geo?.lgas && geo?.wards) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const basePath = import.meta.env?.BASE_URL || "/";

    Promise.all([
      fetch(`${basePath}data/nigeria-states.json`).then((r) =>
        r.ok ? r.json() : null,
      ),
      fetch(`${basePath}data/nigeria_lga.json`).then((r) =>
        r.ok ? r.json() : null,
      ),
      fetch(`${basePath}data/nigeria_ward.json`).then((r) =>
        r.ok ? r.json() : null,
      ),
    ])
      .then(([states, lgas, wards]) => {
        if (isMounted) {
          setGeo({ states, lgas, wards });
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Map Boundary Load Error:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [geo]);

  return { geo, loading };
}

// --- Metric Accessor ---

function getMetricValue(rec: any, metric?: string): number {
  if (!rec) return 0;
  const ext = rec.extended || {};
  const totalHh = Number(
    rec.total_households ?? rec.nsr?.total_households ?? 1,
  );
  const totalChildren = Number(
    rec.children_0_17 ??
      rec.nsr?.children_0_17 ??
      rec.nsr?.children_under18 ??
      1,
  );
  const totalU5 = Number(
    rec.children_0_5 ?? rec.nsr?.children_0_5 ?? rec.nsr?.children_under5 ?? 1,
  );

  switch (metric) {
    case "vulnerability":
    case "livelihoods": {
      const liv =
        ext.livelihoods_resilience_v2 ||
        ext.livelihoods ||
        rec.livelihoods ||
        {};
      const shockProne = Number(liv.shock_prone_hhs ?? 0);
      return totalHh > 0 ? (shockProne / totalHh) * 100 : 0;
    }
    case "education":
    case "oos": {
      const edu = ext.education_v2 || ext.education || rec.education || {};
      const oos = Number(edu.oos_6_17?.oos ?? edu.oos_6_17 ?? 0);
      return totalChildren > 0 ? (oos / totalChildren) * 100 : 0;
    }
    case "civil_registration":
    case "bc": {
      const civil = ext.civil_registration || rec.civil_registration || {};
      const bc = Number(civil.c_0_17_with_bc ?? 0);
      return totalChildren > 0 ? (bc / totalChildren) * 100 : 0;
    }
    case "nin": {
      const civil = ext.civil_registration || rec.civil_registration || {};
      const nin = Number(civil.c_0_17_with_nin ?? 0);
      return totalChildren > 0 ? (nin / totalChildren) * 100 : 0;
    }
    case "nutrition":
    case "sam": {
      const nut = ext.nutrition_v2 || ext.nutrition || rec.nutrition || {};
      const sam = Number(nut.sam_children ?? 0);
      return totalU5 > 0 ? (sam / totalU5) * 100 : 0;
    }
    case "poverty":
    case "poverty_headcount":
    default: {
      return Number(
        rec.pmt_poverty_rate ?? rec.poverty_rate ?? rec.headcount_rate ?? 0,
      );
    }
  }
}

function getColor(
  val: number,
  minVal: number,
  maxVal: number,
  isDark: boolean,
): string {
  if (val === undefined || val === null || isNaN(val)) {
    return isDark ? "#1e293b" : "#e2e8f0";
  }
  if (maxVal === minVal) return "#06b6d4"; // Cyan fallback if all match
  const ratio = Math.min(1, Math.max(0, (val - minVal) / (maxVal - minVal)));

  if (ratio < 0.25) return "#10b981"; // Emerald
  if (ratio < 0.5) return "#06b6d4"; // Cyan
  if (ratio < 0.75) return "#f59e0b"; // Amber
  return "#ef4444"; // Red
}

const MapController: React.FC<{ bounds: L.LatLngBoundsExpression | null }> = ({
  bounds,
}) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      try {
        map.fitBounds(bounds, { padding: [20, 20], maxZoom: 11 });
      } catch {
        // Safe fail
      }
    }
  }, [bounds, map]);
  return null;
};

// --- Main Component ---

export const DrilldownMap: React.FC<DrilldownMapProps> = ({
  data,
  path,
  onNavigate,
  onPathChange,
  selectedStateFilter,
  stateFilter,
  metric = "poverty",
  height = "100%",
}) => {
  const isDark = useDarkMode();
  const handleNavigate = onPathChange || onNavigate;
  const activeStateFilter = selectedStateFilter || stateFilter;

  // Infer geographic level
  const level = useMemo(() => {
    if (!path?.state) return "national";
    if (!path?.lga) return "state";
    if (!path?.ward) return "lga";
    return "ward";
  }, [path]);

  // Load geo
  const { geo, loading } = useGeoData(data);

  // Normalize TopoJSON to GeoJSON
  const parsedGeo = useMemo(() => {
    if (!geo) return { states: null, lgas: null, wards: null };

    const parse = (raw: any) => {
      if (!raw) return null;
      if (raw.type === "Topology" && raw.objects) {
        const key = Object.keys(raw.objects)[0];
        return topojson.feature(raw as any, raw.objects[key]);
      }
      return raw.type === "FeatureCollection" ? raw : null;
    };

    return {
      states: parse(geo.states),
      lgas: parse(geo.lgas),
      wards: parse(geo.wards),
    };
  }, [geo]);

  // Extract relevant features based on current level
  const { geoData, bounds, minVal, maxVal } = useMemo(() => {
    let features: any[] = [];
    let cMin = Infinity;
    let cMax = -Infinity;

    if (level === "national" && parsedGeo.states?.features) {
      features = parsedGeo.states.features;
      features.forEach((f: any) => {
        const name = getGeoStateName(f.properties);
        if (MDP_STATES.has(name)) {
          const rec = data.states?.find((s: any) => normName(s.state) === name);
          const v = getMetricValue(rec, metric);
          if (v < cMin) cMin = v;
          if (v > cMax) cMax = v;
        }
      });
    } else if (level === "state" && parsedGeo.lgas?.features) {
      const targetState = normName(path.state);
      features = parsedGeo.lgas.features.filter(
        (f: any) => getGeoStateName(f.properties) === targetState,
      );
      features.forEach((f: any) => {
        const lgaName = getGeoLgaName(f.properties);
        const rec = data.lgas?.find(
          (l: any) =>
            normName(l.state) === targetState && normName(l.lga) === lgaName,
        );
        const v = getMetricValue(rec, metric);
        if (v < cMin) cMin = v;
        if (v > cMax) cMax = v;
      });
    } else if (level === "lga" && parsedGeo.wards?.features) {
      const targetState = normName(path.state);
      const targetLga = normName(path.lga);
      features = parsedGeo.wards.features.filter((f: any) => {
        return (
          getGeoStateName(f.properties) === targetState &&
          getGeoLgaName(f.properties) === targetLga
        );
      });
      features.forEach((f: any) => {
        const wardName = getGeoWardName(f.properties);
        const rec = data.wards?.find(
          (w: any) =>
            normName(w.state) === targetState &&
            normName(w.lga) === targetLga &&
            normName(w.ward) === wardName,
        );
        const v = getMetricValue(rec, metric);
        if (v < cMin) cMin = v;
        if (v > cMax) cMax = v;
      });
    }

    if (cMin === Infinity) cMin = 0;
    if (cMax === -Infinity) cMax = 100;

    const collection = { type: "FeatureCollection", features };
    let calcBounds: L.LatLngBoundsExpression | null = null;

    if (features.length > 0) {
      try {
        const lGroup = L.geoJSON(collection as any);
        const b = lGroup.getBounds();
        if (b.isValid()) calcBounds = b;
      } catch (e) {
        // Safe fail
      }
    }

    return {
      geoData: collection,
      bounds: calcBounds,
      minVal: cMin,
      maxVal: cMax,
    };
  }, [level, path, parsedGeo, data, metric]);

  // Style Features
  const styleFeature = useCallback(
    (feature: any) => {
      const props = feature?.properties || {};
      const stateName = getGeoStateName(props);
      const isMdpState = MDP_STATES.has(stateName);

      if (level === "national") {
        if (!isMdpState) {
          return {
            fillColor: isDark ? "#1e293b" : "#e2e8f0",
            fillOpacity: 0.35,
            color: isDark ? "#334155" : "#cbd5e1",
            weight: 0.8,
          };
        }

        const isFiltered =
          activeStateFilter &&
          activeStateFilter !== "ALL" &&
          normName(activeStateFilter) !== stateName;

        const rec = data.states?.find(
          (s: any) => normName(s.state) === stateName,
        );
        const val = getMetricValue(rec, metric);
        const color = getColor(val, minVal, maxVal, isDark);

        return {
          fillColor: color,
          fillOpacity: isFiltered ? 0.25 : 0.8,
          color: isDark ? "#0f172a" : "#ffffff",
          weight: 1.5,
        };
      }

      let val = 0;
      if (level === "state") {
        const lgaName = getGeoLgaName(props);
        const rec = data.lgas?.find(
          (l: any) =>
            normName(l.state) === normName(path.state) &&
            normName(l.lga) === lgaName,
        );
        val = getMetricValue(rec, metric);
      } else if (level === "lga") {
        const wardName = getGeoWardName(props);
        const rec = data.wards?.find(
          (w: any) =>
            normName(w.state) === normName(path.state) &&
            normName(w.lga) === normName(path.lga) &&
            normName(w.ward) === wardName,
        );
        val = getMetricValue(rec, metric);
      }

      return {
        fillColor: getColor(val, minVal, maxVal, isDark),
        fillOpacity: 0.8,
        color: isDark ? "#0f172a" : "#ffffff",
        weight: 1.2,
      };
    },
    [level, path, data, metric, minVal, maxVal, isDark, activeStateFilter],
  );

  // Feature Events (Hover & Click)
  const onEachFeature = useCallback(
    (feature: any, layer: L.Layer) => {
      const props = feature?.properties || {};
      const stateName = getGeoStateName(props);
      const lgaName = getGeoLgaName(props);
      const wardName = getGeoWardName(props);

      let displayName = stateName;
      let val = 0;

      if (level === "national") {
        displayName = props.NAME_1 || props.state || stateName;
        const rec = data.states?.find(
          (s: any) => normName(s.state) === stateName,
        );
        val = getMetricValue(rec, metric);
      } else if (level === "state") {
        displayName = props.NAME_2 || props.lga || lgaName;
        const rec = data.lgas?.find(
          (l: any) =>
            normName(l.state) === normName(path.state) &&
            normName(l.lga) === lgaName,
        );
        val = getMetricValue(rec, metric);
      } else {
        displayName = props.NAME_3 || props.ward || wardName;
        const rec = data.wards?.find(
          (w: any) =>
            normName(w.state) === normName(path.state) &&
            normName(w.lga) === normName(path.lga) &&
            normName(w.ward) === wardName,
        );
        val = getMetricValue(rec, metric);
      }

      const formattedVal = typeof val === "number" ? val.toFixed(1) : "0.0";
      layer.bindTooltip(
        `<div class="font-sans font-bold text-xs p-0.5">${displayName}: <span class="text-teal-400">${formattedVal}%</span></div>`,
        { sticky: true },
      );

      layer.on({
        mouseover: (e) => {
          const l = e.target;
          l.setStyle({ fillOpacity: 0.95, weight: 2.5, color: "#38bdf8" });
          l.bringToFront();
        },
        mouseout: (e) => {
          const l = e.target;
          l.setStyle(styleFeature(feature));
        },
        click: () => {
          if (!handleNavigate) return;
          if (level === "national" && MDP_STATES.has(stateName)) {
            handleNavigate({ state: stateName });
          } else if (level === "state") {
            handleNavigate({ state: path.state, lga: lgaName });
          } else if (level === "lga") {
            handleNavigate({
              state: path.state,
              lga: path.lga,
              ward: wardName,
            });
          }
        },
      });
    },
    [level, path, data, metric, styleFeature, handleNavigate],
  );

  const containerBg = isDark ? "#0f172a" : "#f8fafc";
  const hasFeatures = geoData && geoData.features.length > 0;

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-line-light dark:border-line-dark shadow-card"
      style={{ height }}
    >
      {/* Fallback Loader Overlay */}
      {(!hasFeatures || loading) && (
        <div className="absolute inset-0 z-[2000] flex flex-col items-center justify-center bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-sm">
          <div className="w-8 h-8 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin mb-3"></div>
          <div className="text-sm font-bold text-ink-muted dark:text-ink-onDarkMuted tracking-wider animate-pulse">
            LOADING MAP BOUNDARIES...
          </div>
        </div>
      )}

      <MapContainer
        center={[9.082, 8.6753]}
        zoom={6}
        minZoom={5}
        style={{
          height: "100%",
          width: "100%",
          backgroundColor: containerBg,
          zIndex: 1,
        }}
        zoomControl={true}
        attributionControl={false}
      >
        <MapController bounds={bounds} />
        {hasFeatures && (
          <GeoJSON
            key={`${level}-${path.state || ""}-${path.lga || ""}-${metric}-${isDark ? "dark" : "light"}-${geoData.features.length}`}
            data={geoData as any}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>

      {/* Floating Gradient Legend */}
      <div className="absolute top-3 right-3 z-[1000] bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur border border-line-light dark:border-line-dark rounded-lg p-2.5 shadow-md text-xs pointer-events-none">
        <div className="font-bold text-ink-main dark:text-ink-onDark mb-1 capitalize">
          {metric.replace("_", " ")} Rate
        </div>
        <div className="flex items-center space-x-2 text-[10px] text-ink-muted dark:text-ink-onDarkMuted">
          <span>{minVal.toFixed(1)}%</span>
          <div className="w-20 h-2 rounded bg-gradient-to-r from-emerald-500 via-cyan-500 via-amber-500 to-red-500" />
          <span>{maxVal.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

export default DrilldownMap;
