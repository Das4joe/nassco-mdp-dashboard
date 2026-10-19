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

function normName(val: any): string {
  if (!val) return "";
  let s = String(val).trim();
  if (s.includes(".")) {
    const parts = s.split(".", 2);
    s = parts[1] || parts[0];
  }
  return s.toUpperCase().trim();
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

// Self-healing hook to fetch geojson if it's missing from the main data payload
function useGeoData(data: any) {
  const [geo, setGeo] = useState<any>(data?.geo || data?.geoData || null);

  useEffect(() => {
    if (geo) return;
    let isMounted = true;
    Promise.all([
      fetch("/data/nigeria-states.json")
        .then((r) => r.json())
        .catch(() => null),
      fetch("/data/nigeria_lga.json")
        .then((r) => r.json())
        .catch(() => null),
      fetch("/data/nigeria_ward.json")
        .then((r) => r.json())
        .catch(() => null),
    ]).then(([states, lgas, wards]) => {
      if (isMounted) {
        setGeo({ states, lgas, wards });
      }
    });
    return () => {
      isMounted = false;
    };
  }, [geo]);

  return geo;
}

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
  const ratio =
    maxVal > minVal
      ? Math.min(1, Math.max(0, (val - minVal) / (maxVal - minVal)))
      : 0.5;

  if (ratio < 0.25) return "#10b981"; // emerald-500
  if (ratio < 0.5) return "#06b6d4"; // cyan-500
  if (ratio < 0.75) return "#f59e0b"; // amber-500
  return "#ef4444"; // red-500
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
        // ignore bounds fit errors
      }
    }
  }, [bounds, map]);
  return null;
};

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

  // Infer geographic drilldown level from path object
  const level = useMemo(() => {
    if (!path?.state) return "national";
    if (!path?.lga) return "state";
    if (!path?.ward) return "lga";
    return "ward";
  }, [path]);

  const activeGeo = useGeoData(data);

  // 1. Convert State TopoJSON to GeoJSON
  const statesGeoJson = useMemo(() => {
    if (!activeGeo?.states) return null;
    const obj = activeGeo.states;
    if (obj.type === "Topology" && obj.objects) {
      const key = Object.keys(obj.objects)[0];
      return topojson.feature(obj as any, obj.objects[key]) as any;
    }
    if (obj.type === "FeatureCollection") return obj;
    return null;
  }, [activeGeo]);

  // 2. Filter features based on path level
  const { geoData, bounds, minVal, maxVal } = useMemo(() => {
    let features: any[] = [];
    let calculatedMin = Infinity;
    let calculatedMax = -Infinity;

    if (level === "national") {
      if (statesGeoJson?.features) {
        features = statesGeoJson.features;
        features.forEach((f: any) => {
          const name = normName(
            f.properties?.NAME_1 || f.properties?.state || f.properties?.STATE,
          );
          if (MDP_STATES.has(name)) {
            const rec = data.states?.find(
              (s: any) => normName(s.state) === name,
            );
            const v = getMetricValue(rec, metric);
            if (v < calculatedMin) calculatedMin = v;
            if (v > calculatedMax) calculatedMax = v;
          }
        });
      }
    } else if (level === "state") {
      const stateName = normName(path.state);
      const lgaGeo = activeGeo?.lgas;
      if (lgaGeo?.features) {
        features = lgaGeo.features.filter((f: any) => {
          const st = normName(
            f.properties?.NAME_1 || f.properties?.state || f.properties?.STATE,
          );
          return st === stateName;
        });
        features.forEach((f: any) => {
          const lgaName = normName(
            f.properties?.NAME_2 || f.properties?.lga || f.properties?.LGA,
          );
          const rec = data.lgas?.find(
            (l: any) =>
              normName(l.state) === stateName && normName(l.lga) === lgaName,
          );
          const v = getMetricValue(rec, metric);
          if (v < calculatedMin) calculatedMin = v;
          if (v > calculatedMax) calculatedMax = v;
        });
      }
    } else if (level === "lga") {
      const stateName = normName(path.state);
      const lgaName = normName(path.lga);
      const wardGeo = activeGeo?.wards;
      if (wardGeo?.features) {
        features = wardGeo.features.filter((f: any) => {
          const st = normName(
            f.properties?.NAME_1 || f.properties?.state || f.properties?.STATE,
          );
          const lg = normName(
            f.properties?.NAME_2 || f.properties?.lga || f.properties?.LGA,
          );
          return st === stateName && lg === lgaName;
        });
        features.forEach((f: any) => {
          const wardName = normName(
            f.properties?.NAME_3 || f.properties?.ward || f.properties?.WARD,
          );
          const rec = data.wards?.find(
            (w: any) =>
              normName(w.state) === stateName &&
              normName(w.lga) === lgaName &&
              normName(w.ward) === wardName,
          );
          const v = getMetricValue(rec, metric);
          if (v < calculatedMin) calculatedMin = v;
          if (v > calculatedMax) calculatedMax = v;
        });
      }
    }

    if (calculatedMin === Infinity) calculatedMin = 0;
    if (calculatedMax === -Infinity) calculatedMax = 100;

    const collection = { type: "FeatureCollection", features };
    let calculatedBounds: L.LatLngBoundsExpression | null = null;
    if (features.length > 0) {
      try {
        const lGroup = L.geoJSON(collection as any);
        if (lGroup.getBounds().isValid()) {
          calculatedBounds = lGroup.getBounds();
        }
      } catch {
        calculatedBounds = null;
      }
    }

    return {
      geoData: collection,
      bounds: calculatedBounds,
      minVal: calculatedMin,
      maxVal: calculatedMax,
    };
  }, [data, path, level, statesGeoJson, activeGeo, metric]);

  // 3. Polygon Styling Callback
  const styleFeature = useCallback(
    (feature: any) => {
      const props = feature?.properties || {};
      const stateName = normName(props.NAME_1 || props.state || props.STATE);
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

      // State / LGA level
      let val = 0;
      if (level === "state") {
        const lgaName = normName(props.NAME_2 || props.lga || props.LGA);
        const rec = data.lgas?.find(
          (l: any) =>
            normName(l.state) === normName(path.state) &&
            normName(l.lga) === lgaName,
        );
        val = getMetricValue(rec, metric);
      } else if (level === "lga") {
        const wardName = normName(props.NAME_3 || props.ward || props.WARD);
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

  // 4. Feature Events Callback
  const onEachFeature = useCallback(
    (feature: any, layer: L.Layer) => {
      const props = feature?.properties || {};
      const stateName = normName(props.NAME_1 || props.state || props.STATE);
      const lgaName = normName(props.NAME_2 || props.lga || props.LGA);
      const wardName = normName(props.NAME_3 || props.ward || props.WARD);

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

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-line-light dark:border-line-dark shadow-card"
      style={{ height }}
    >
      <MapContainer
        center={[9.082, 8.6753]}
        zoom={6}
        minZoom={5}
        maxBounds={[
          [2.0, 0.0], // South West boundary
          [15.0, 16.0], // North East boundary
        ]}
        maxBoundsViscosity={1.0}
        style={{ height: "100%", width: "100%", backgroundColor: containerBg }}
        zoomControl={true}
        attributionControl={false}
      >
        <MapController bounds={bounds} />
        {geoData && geoData.features.length > 0 && (
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
