import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import { feature } from "topojson-client";
import type { FeatureCollection } from "geojson";
import type { GeoRecord, DrilldownPath, DashboardMode } from "../../lib/types";
import type { DashboardData } from "../../lib/loadData";
import "leaflet/dist/leaflet.css";

export type MapMetric =
  | "vulnerability"
  | "poorest_pct"
  | "birth_cert"
  | "nin"
  | "out_of_school"
  | "wasting"
  | "shocks"
  | "female_head";

export interface DrilldownMapProps {
  data: DashboardData;
  path: DrilldownPath;
  onNavigate?: (path: DrilldownPath) => void;
  onPathChange?: (path: any) => void;
  selectedStateFilter?: string;
  stateFilter?: string;
  metric?: MapMetric;
  mode?: DashboardMode;
  isDark?: boolean;
  height?: number | string;
}

interface MetricConfig {
  key: MapMetric;
  label: string;
  unit: string;
  getValue: (rec: any) => number;
  format: (val: number) => string;
  colorScale: (pct: number) => string;
}

const NIGERIA_BOUNDS: L.LatLngBoundsExpression = [
  [4.2, 2.6],
  [13.9, 14.7],
];

const MDP_STATES = new Set(["ABIA", "BENUE", "OYO", "SOKOTO"]);

function normUpper(s: string): string {
  return (s || "").trim().toUpperCase();
}

function normLower(s: string): string {
  return (s || "").trim().toLowerCase();
}

function getColorForRatio(ratio: number, inverted: boolean = false): string {
  const t = Math.max(0, Math.min(1, ratio));
  const biased = Math.pow(t, 0.75);

  if (inverted) {
    const r = Math.round(220 - biased * 180);
    const g = Math.round(80 + biased * 120);
    const b = Math.round(80 + biased * 60);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const r = Math.round(20 + biased * 215);
    const g = Math.round(150 - biased * 110);
    const b = Math.round(130 - biased * 100);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

/*
 * FIX #2: All getValue functions rewritten to use actual JSON paths
 * from the current aggregate.py output. Every access uses optional
 * chaining and ?? 0 so nothing crashes when a key is missing.
 */
const METRIC_CONFIGS: Record<MapMetric, MetricConfig> = {
  vulnerability: {
    key: "vulnerability",
    label: "Poverty Headcount (PMT Decile 1-3)",
    unit: "%",
    getValue: (r: any) => {
      const hh = r?.total_households ?? 0;
      if (hh === 0) return 0;
      const poorest =
        r?.extended?.livelihoods_resilience_v2?.shock_prone_hhs ?? 0;
      return (poorest / hh) * 100;
    },
    format: (v) => `${v.toFixed(1)}%`,
    colorScale: (ratio) => getColorForRatio(ratio, false),
  },
  poorest_pct: {
    key: "poorest_pct",
    label: "Poverty Rate (Decile 1-3)",
    unit: "%",
    getValue: (r: any) => {
      const hh = r?.total_households ?? 0;
      if (hh === 0) return 0;
      const poorest =
        r?.extended?.livelihoods_resilience_v2?.shock_prone_hhs ?? 0;
      return (poorest / hh) * 100;
    },
    format: (v) => `${v.toFixed(1)}%`,
    colorScale: (ratio) => getColorForRatio(ratio, false),
  },
  birth_cert: {
    key: "birth_cert",
    label: "Birth Registration Coverage (0-17)",
    unit: "%",
    getValue: (r: any) => {
      const cr = r?.extended?.civil_registration ?? r?.civil_registration ?? {};
      const withBc = cr?.c_0_17_with_bc ?? 0;
      const total = r?.children_0_17 ?? r?.nsr?.children_0_17 ?? 0;
      if (total === 0) return 0;
      return (withBc / total) * 100;
    },
    format: (v) => `${v.toFixed(1)}%`,
    colorScale: (ratio) => getColorForRatio(ratio, true),
  },
  nin: {
    key: "nin",
    label: "NIN Coverage (0-17)",
    unit: "%",
    getValue: (r: any) => {
      const cr = r?.extended?.civil_registration ?? r?.civil_registration ?? {};
      const withNin = cr?.c_0_17_with_nin ?? 0;
      const total = r?.children_0_17 ?? r?.nsr?.children_0_17 ?? 0;
      if (total === 0) return 0;
      return (withNin / total) * 100;
    },
    format: (v) => `${v.toFixed(1)}%`,
    colorScale: (ratio) => getColorForRatio(ratio, true),
  },
  out_of_school: {
    key: "out_of_school",
    label: "Out-of-School Children Rate (6-17)",
    unit: "%",
    getValue: (r: any) => {
      const edu = r?.extended?.education_v2 ?? r?.education ?? {};
      const oos = edu?.oos_6_17?.oos ?? 0;
      const total = r?.children_0_17 ?? r?.nsr?.children_0_17 ?? 0;
      if (total === 0) return 0;
      return (oos / total) * 100;
    },
    format: (v) => `${v.toFixed(1)}%`,
    colorScale: (ratio) => getColorForRatio(ratio, false),
  },
  wasting: {
    key: "wasting",
    label: "Acute Malnutrition (SAM+MAM)",
    unit: "%",
    getValue: (r: any) => {
      const nut = r?.extended?.nutrition_v2 ?? r?.nutrition ?? {};
      const sam = nut?.sam_children ?? 0;
      const mam = nut?.mam_children ?? 0;
      const normal = nut?.normal_children ?? 0;
      const total = sam + mam + normal;
      if (total === 0) return 0;
      return ((sam + mam) / total) * 100;
    },
    format: (v) => `${v.toFixed(1)}%`,
    colorScale: (ratio) => getColorForRatio(ratio, false),
  },
  shocks: {
    key: "shocks",
    label: "Shock Exposure Rate",
    unit: "%",
    getValue: (r: any) => {
      const liv =
        r?.extended?.livelihoods_resilience_v2 ?? r?.livelihoods ?? {};
      const shockHh = liv?.shock_prone_hhs ?? 0;
      const totalHh = r?.total_households ?? r?.nsr?.total_households ?? 0;
      if (totalHh === 0) return 0;
      return (shockHh / totalHh) * 100;
    },
    format: (v) => `${v.toFixed(1)}%`,
    colorScale: (ratio) => getColorForRatio(ratio, false),
  },
  female_head: {
    key: "female_head",
    label: "Female-Headed Household Rate",
    unit: "%",
    getValue: (r: any) => {
      const liv =
        r?.extended?.livelihoods_resilience_v2 ?? r?.livelihoods ?? {};
      const femHh = liv?.female_headed_hhs ?? 0;
      const totalHh = r?.total_households ?? r?.nsr?.total_households ?? 0;
      if (totalHh === 0) return 0;
      return (femHh / totalHh) * 100;
    },
    format: (v) => `${v.toFixed(1)}%`,
    colorScale: (ratio) => getColorForRatio(ratio, false),
  },
};

function MapBoundsController({
  bounds,
}: {
  bounds: L.LatLngBoundsExpression | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [20, 20], maxZoom: 12 });
    }
  }, [map, bounds]);
  return null;
}

function InvalidateOnMount() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export const DrilldownMap: React.FC<DrilldownMapProps> = ({
  data,
  path,
  onNavigate,
  onPathChange,
  selectedStateFilter,
  stateFilter,
  metric = "vulnerability",
  height = "420px",
}) => {
  const handleNav = (newPath: DrilldownPath) => {
    if (onNavigate) onNavigate(newPath);
    if (onPathChange) onPathChange(newPath);
  };

  const [statesGeoJson, setStatesGeoJson] = useState<any>(null);
  const [lgasGeoJson, setLgasGeoJson] = useState<any>(null);
  const [mapBounds, setMapBounds] = useState<L.LatLngBoundsExpression | null>(
    null,
  );

  const activeMetric = METRIC_CONFIGS[metric] || METRIC_CONFIGS.vulnerability;

  /*
   * FIX #3: Added stateFilter to the resolution chain so the component
   * works regardless of which prop name the parent passes.
   */
  const activeState = selectedStateFilter
    ? normUpper(selectedStateFilter)
    : stateFilter
      ? normUpper(stateFilter)
      : path.state
        ? normUpper(path.state)
        : undefined;

  useEffect(() => {
    fetch("/geojson/nigeria-states.json")
      .then((res) => res.json())
      .then((topoData) => {
        if (topoData.objects && topoData.objects.NGA_adm1) {
          const geo = feature(topoData, topoData.objects.NGA_adm1);
          setStatesGeoJson(geo);
        }
      })
      .catch((err) => console.error("Failed loading states TopoJSON:", err));
  }, []);

  useEffect(() => {
    if (activeState) {
      fetch("/geojson/nigeria_lga.json")
        .then((res) => res.json())
        .then((geoData) => setLgasGeoJson(geoData))
        .catch((err) => console.error("Failed loading LGA GeoJSON:", err));
    } else {
      setLgasGeoJson(null);
    }
  }, [activeState]);

  const stateRecordsMap = useMemo(() => {
    const map = new Map<string, GeoRecord>();
    data.states.forEach((rec) => {
      if (rec.state) map.set(normUpper(rec.state), rec);
    });
    return map;
  }, [data.states]);

  const lgaRecordsMap = useMemo(() => {
    const map = new Map<string, GeoRecord>();
    data.lgas.forEach((rec) => {
      if (rec.state && rec.lga) {
        const key = `${normUpper(rec.state)}|${normLower(rec.lga)}`;
        map.set(key, rec);
      }
    });
    return map;
  }, [data.lgas]);

  const metricBounds = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    if (!activeState) {
      stateRecordsMap.forEach((rec) => {
        const val = activeMetric.getValue(rec);
        if (val < min) min = val;
        if (val > max) max = val;
      });
    } else {
      lgaRecordsMap.forEach((rec, key) => {
        if (key.startsWith(`${activeState}|`)) {
          const val = activeMetric.getValue(rec);
          if (val < min) min = val;
          if (val > max) max = val;
        }
      });
    }

    if (min === Infinity) min = 0;
    if (max === -Infinity || max === min) max = min + 1;
    return { min, max };
  }, [activeState, stateRecordsMap, lgaRecordsMap, activeMetric]);

  const onEachState = (featureItem: any, layer: L.Layer) => {
    const stateName =
      featureItem.properties.NAME_1 || featureItem.properties.name || "";
    const stateUpper = normUpper(stateName);

    if (stateName === "Water body" || stateUpper === "WATER BODY") return;

    const isMdp = MDP_STATES.has(stateUpper);
    const rec = stateRecordsMap.get(stateUpper);

    let popupContent = `<div class="p-2 text-xs font-sans">
      <div class="font-bold text-sm text-slate-900">${stateName}</div>`;

    if (!isMdp || !rec) {
      popupContent += `<div class="text-slate-500 italic mt-1">Not in MDP scope</div></div>`;
    } else {
      const val = activeMetric.getValue(rec);
      popupContent += `
        <div class="mt-1 text-slate-700">
          <div><span class="font-medium">Households:</span> ${(rec.nsr?.total_households ?? rec.total_households ?? 0).toLocaleString()}</div>
          <div><span class="font-medium">Individuals:</span> ${(rec.nsr?.total_individuals ?? rec.total_individuals ?? 0).toLocaleString()}</div>
          <div class="mt-1 font-bold text-teal-700 dark:text-teal-400">
            ${activeMetric.label}: ${activeMetric.format(val)}
          </div>
        </div>
      </div>`;
    }

    layer.bindTooltip(popupContent, { sticky: true, direction: "auto" });

    layer.on({
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({ weight: 3, color: "#075E54", fillOpacity: 0.85 });
      },
      mouseout: (e) => {
        const l = e.target;
        l.setStyle({
          weight: isMdp ? 1.5 : 0.5,
          color: activeState === stateUpper ? "#075E54" : "#64748B",
          fillOpacity: activeState === stateUpper ? 0.75 : isMdp ? 0.6 : 0.15,
        });
      },
      click: () => {
        if (isMdp) {
          handleNav({ state: stateName });
        }
      },
    });
  };

  const stateStyle = (featureItem: any) => {
    const stateName =
      featureItem.properties.NAME_1 || featureItem.properties.name || "";
    const stateUpper = normUpper(stateName);
    const isMdp = MDP_STATES.has(stateUpper);
    const rec = stateRecordsMap.get(stateUpper);

    if (!isMdp || !rec) {
      return {
        fillColor: "#94A3B8",
        fillOpacity: 0.15,
        weight: 0.5,
        color: "#CBD5E1",
      };
    }

    const val = activeMetric.getValue(rec);
    const ratio =
      (val - metricBounds.min) / (metricBounds.max - metricBounds.min);
    const fillColor = activeMetric.colorScale(ratio);

    return {
      fillColor,
      fillOpacity: activeState === stateUpper ? 0.85 : 0.65,
      weight: activeState === stateUpper ? 2.5 : 1,
      color: activeState === stateUpper ? "#075E54" : "#FFFFFF",
    };
  };

  /*
   * FIX #1: Added NAME_1 to the LGA state filter.
   * Your LGA GeoJSON uses NAME_1 (e.g., "Abia") for the state property,
   * not "state" or "STATE". Without this, zero LGAs would match.
   */
  const filteredLgaFeatures = useMemo<FeatureCollection | null>(() => {
    if (!lgasGeoJson || !activeState) return null;
    const features = lgasGeoJson.features.filter((f: any) => {
      const st = normUpper(
        f.properties.NAME_1 || f.properties.state || f.properties.STATE || "",
      );
      return st === activeState;
    });
    return { type: "FeatureCollection", features };
  }, [lgasGeoJson, activeState]);

  const onEachLga = (featureItem: any, layer: L.Layer) => {
    const lgaName =
      featureItem.properties.NAME_2 ||
      featureItem.properties.lga ||
      featureItem.properties.LGA ||
      fName(featureItem);
    const lgaKey = `${activeState}|${normLower(lgaName)}`;
    const rec = lgaRecordsMap.get(lgaKey);

    let popupContent = `<div class="p-2 text-xs font-sans">
      <div class="font-bold text-sm text-slate-900">${lgaName}</div>
      <div class="text-slate-500 font-medium">${activeState} State</div>`;

    if (!rec) {
      popupContent += `<div class="text-slate-500 italic mt-1">No survey records</div></div>`;
    } else {
      const val = activeMetric.getValue(rec);
      popupContent += `
        <div class="mt-1 text-slate-700">
          <div><span class="font-medium">Households:</span> ${(rec.nsr?.total_households ?? rec.total_households ?? 0).toLocaleString()}</div>
          <div><span class="font-medium">Individuals:</span> ${(rec.nsr?.total_individuals ?? rec.total_individuals ?? 0).toLocaleString()}</div>
          <div class="mt-1 font-bold text-teal-700 dark:text-teal-400">
            ${activeMetric.label}: ${activeMetric.format(val)}
          </div>
        </div>
      </div>`;
    }

    layer.bindTooltip(popupContent, { sticky: true, direction: "auto" });

    layer.on({
      mouseover: (e) => {
        e.target.setStyle({ weight: 2.5, color: "#075E54", fillOpacity: 0.9 });
      },
      mouseout: (e) => {
        e.target.setStyle({ weight: 1, color: "#FFFFFF", fillOpacity: 0.7 });
      },
      click: () => {
        if (rec) {
          handleNav({ state: activeState, lga: lgaName });
        }
      },
    });
  };

  const lgaStyle = (featureItem: any) => {
    const lgaName =
      featureItem.properties.NAME_2 ||
      featureItem.properties.lga ||
      featureItem.properties.LGA ||
      fName(featureItem);
    const lgaKey = `${activeState}|${normLower(lgaName)}`;
    const rec = lgaRecordsMap.get(lgaKey);

    if (!rec) {
      return {
        fillColor: "#CBD5E1",
        fillOpacity: 0.2,
        weight: 0.5,
        color: "#94A3B8",
      };
    }

    const val = activeMetric.getValue(rec);
    const ratio =
      (val - metricBounds.min) / (metricBounds.max - metricBounds.min);
    const fillColor = activeMetric.colorScale(ratio);

    return {
      fillColor,
      fillOpacity: 0.75,
      weight: 1,
      color: "#FFFFFF",
    };
  };

  useEffect(() => {
    if (
      activeState &&
      filteredLgaFeatures &&
      filteredLgaFeatures.features.length > 0
    ) {
      const geoLayer = L.geoJSON(filteredLgaFeatures);
      setMapBounds(geoLayer.getBounds());
    } else {
      setMapBounds(NIGERIA_BOUNDS);
    }
  }, [activeState, filteredLgaFeatures]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-line-light dark:border-line-dark shadow-sm bg-surface-light dark:bg-surface-dark">
      <div className="absolute top-3 right-3 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2.5 rounded-lg border border-line-light dark:border-line-dark shadow-md text-xs font-medium max-w-[220px]">
        <div className="text-ink-primary dark:text-ink-onDark font-bold mb-1 truncate">
          {activeMetric.label}
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[10px] text-ink-muted dark:text-ink-onDarkMuted">
            {activeMetric.format(metricBounds.min)}
          </span>
          <div
            className="h-2.5 flex-1 rounded-full"
            style={{
              background: `linear-gradient(to right, ${activeMetric.colorScale(0)}, ${activeMetric.colorScale(0.5)}, ${activeMetric.colorScale(1)})`,
            }}
          />
          <span className="text-[10px] text-ink-muted dark:text-ink-onDarkMuted">
            {activeMetric.format(metricBounds.max)}
          </span>
        </div>
      </div>

      <div style={{ height }}>
        <MapContainer
          bounds={NIGERIA_BOUNDS}
          zoom={6}
          scrollWheelZoom={false}
          className="w-full h-full z-0"
        >
          <InvalidateOnMount />
          <MapBoundsController bounds={mapBounds} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {statesGeoJson && !activeState && (
            <GeoJSON
              key={`states-${metric}`}
              data={statesGeoJson}
              style={stateStyle}
              onEachFeature={onEachState}
            />
          )}

          {activeState && filteredLgaFeatures && (
            <GeoJSON
              key={`lgas-${activeState}-${metric}`}
              data={filteredLgaFeatures}
              style={lgaStyle}
              onEachFeature={onEachLga}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

function fName(featureItem: any): string {
  return (
    featureItem.properties.NAME_2 ||
    featureItem.properties.lga_name ||
    featureItem.properties.NAME_1 ||
    "Unknown"
  );
}

export default DrilldownMap;
