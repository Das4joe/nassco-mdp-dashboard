import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, GeoJSON, useMap } from "react-leaflet";
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
  data?: DashboardData | null;
  path: DrilldownPath;
  onNavigate?: (path: DrilldownPath) => void;
  onPathChange?: (path: any) => void;
  selectedStateFilter?: string;
  metric?: MapMetric;
  mode?: DashboardMode;
  isDark?: boolean;
  height?: number | string;
}

interface MetricConfig {
  key: MapMetric;
  label: string;
  unit: string;
  getValue: (rec: GeoRecord) => number;
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

const METRIC_CONFIGS: Record<MapMetric, MetricConfig> = {
  vulnerability: {
    key: "vulnerability",
    label: "Vulnerability Index",
    unit: "pts",
    getValue: (r) => r.vulnerability?.vulnerability_index ?? 0,
    format: (v) => `${v.toFixed(1)} pts`,
    colorScale: (ratio) => getColorForRatio(ratio, false),
  },
  poorest_pct: {
    key: "poorest_pct",
    label: "Poverty Rate (Decile 1-3)",
    unit: "%",
    getValue: (r) => r.vulnerability?.poorest_pct ?? 0,
    format: (v) => `${v.toFixed(1)}%`,
    colorScale: (ratio) => getColorForRatio(ratio, false),
  },
  birth_cert: {
    key: "birth_cert",
    label: "Birth Registration (0-17)",
    unit: "%",
    getValue: (r) =>
      r.extended?.civil_registration?.children_0_17?.birth_cert_pct ?? 0,
    format: (v) => `${v.toFixed(1)}%`,
    colorScale: (ratio) => getColorForRatio(ratio, true),
  },
  nin: {
    key: "nin",
    label: "NIN Coverage (0-17)",
    unit: "%",
    getValue: (r) =>
      r.extended?.civil_registration?.children_0_17?.nin_pct ?? 0,
    format: (v) => `${v.toFixed(1)}%`,
    colorScale: (ratio) => getColorForRatio(ratio, true),
  },
  out_of_school: {
    key: "out_of_school",
    label: "Out-of-School Children Rate (6-17)",
    unit: "%",
    getValue: (r) => r.extended?.education_v2?.oos_6_17?.oos_pct ?? 0,
    format: (v) => `${v.toFixed(1)}%`,
    colorScale: (ratio) => getColorForRatio(ratio, false),
  },
  wasting: {
    key: "wasting",
    label: "Under-5 Wasting Rate",
    unit: "%",
    getValue: (r) => r.extended?.nutrition_v2?.wasting_pct ?? 0,
    format: (v) => `${v.toFixed(1)}%`,
    colorScale: (ratio) => getColorForRatio(ratio, false),
  },
  shocks: {
    key: "shocks",
    label: "Shock Exposure Rate",
    unit: "%",
    getValue: (r) =>
      r.extended?.livelihoods_resilience_v2?.shock_exposure?.shock_hh_pct ?? 0,
    format: (v) => `${v.toFixed(1)}%`,
    colorScale: (ratio) => getColorForRatio(ratio, false),
  },
  female_head: {
    key: "female_head",
    label: "Female Primary Respondent Rate",
    unit: "%",
    getValue: (r) => r.extended?.female_primary_respondent?.pct ?? 0,
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
  metric = "vulnerability",
  isDark = false,
  height = "420px",
}) => {
  const handleNav = (newPath: DrilldownPath) => {
    if (onNavigate) onNavigate(newPath);
    if (onPathChange) onPathChange(newPath);
  };

  const [statesGeoJson, setStatesGeoJson] = useState<any>(null);
  const [lgasGeoJson, setLgasGeoJson] = useState<any>(null);
  const [wardsGeoJson, setWardsGeoJson] = useState<any>(null);
  const [mapBounds, setMapBounds] = useState<L.LatLngBoundsExpression | null>(
    null,
  );

  const activeMetric = METRIC_CONFIGS[metric] || METRIC_CONFIGS.vulnerability;

  const activeState = selectedStateFilter
    ? normUpper(selectedStateFilter)
    : path.state
      ? normUpper(path.state)
      : undefined;
  const activeLga = path.lga ? normUpper(path.lga) : undefined;

  useEffect(() => {
    fetch("/geojson/nigeria-states.json")
      .then((res) => res.json())
      .then((topoData) => {
        if (topoData.objects?.NGA_adm1) {
          setStatesGeoJson(feature(topoData, topoData.objects.NGA_adm1));
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

  useEffect(() => {
    if (activeState && activeLga) {
      fetch("/geojson/nigeria_ward.json")
        .then((res) => res.json())
        .then((geoData) => setWardsGeoJson(geoData))
        .catch((err) => console.error("Failed loading Ward GeoJSON:", err));
    } else {
      setWardsGeoJson(null);
    }
  }, [activeState, activeLga]);

  const stateRecordsMap = useMemo(() => {
    const map = new Map<string, GeoRecord>();
    const states =
      data && "states" in data && Array.isArray(data.states) ? data.states : [];
    states.forEach((rec) => {
      if (rec.state) map.set(normUpper(rec.state), rec);
    });
    return map;
  }, [data]);

  const lgaRecordsMap = useMemo(() => {
    const map = new Map<string, GeoRecord>();
    const lgas =
      data && "lgas" in data && Array.isArray(data.lgas) ? data.lgas : [];
    lgas.forEach((rec) => {
      if (rec.state && rec.lga) {
        map.set(`${normUpper(rec.state)}||${normUpper(rec.lga)}`, rec);
      }
    });
    return map;
  }, [data]);

  const wardRecordsMap = useMemo(() => {
    const map = new Map<string, GeoRecord>();
    const wards =
      data && "wards" in data && Array.isArray(data.wards) ? data.wards : [];
    wards.forEach((rec) => {
      if (rec.state && rec.lga && rec.ward) {
        map.set(
          `${normUpper(rec.state)}||${normUpper(rec.lga)}||${normUpper(rec.ward)}`,
          rec,
        );
      }
    });
    return map;
  }, [data]);

  const filteredGeoJson = useMemo(() => {
    if (activeState && activeLga && wardsGeoJson) {
      const features = (wardsGeoJson.features || []).filter((f: any) => {
        const fState =
          f.properties?.state_name ||
          f.properties?.state ||
          f.properties?.NAME_1;
        const fLga =
          f.properties?.lga_name || f.properties?.lga || f.properties?.NAME_2;
        return (
          normUpper(fState) === activeState && normUpper(fLga) === activeLga
        );
      });
      return { type: "FeatureCollection", features } as FeatureCollection;
    }

    if (activeState && lgasGeoJson) {
      const features = (lgasGeoJson.features || []).filter((f: any) => {
        const fState =
          f.properties?.NAME_1 ||
          f.properties?.state_name ||
          f.properties?.state;
        return normUpper(fState) === activeState;
      });
      return { type: "FeatureCollection", features } as FeatureCollection;
    }

    return statesGeoJson;
  }, [statesGeoJson, lgasGeoJson, wardsGeoJson, activeState, activeLga]);

  useEffect(() => {
    if (
      filteredGeoJson &&
      filteredGeoJson.features &&
      filteredGeoJson.features.length > 0
    ) {
      try {
        const tempLayer = L.geoJSON(filteredGeoJson);
        const bounds = tempLayer.getBounds();
        if (bounds.isValid()) {
          setMapBounds(bounds);
        }
      } catch (e) {
        console.error("Error calculating map bounds:", e);
      }
    } else {
      setMapBounds(NIGERIA_BOUNDS);
    }
  }, [filteredGeoJson]);

  const valueRange = useMemo(() => {
    if (!filteredGeoJson || !filteredGeoJson.features)
      return { min: 0, max: 100 };
    const values: number[] = [];
    filteredGeoJson.features.forEach((f: any) => {
      let rec: GeoRecord | undefined;
      const fState =
        f.properties?.state_name ||
        f.properties?.state ||
        f.properties?.NAME_1 ||
        f.properties?.admin1Name;
      const fLga =
        f.properties?.lga_name ||
        f.properties?.lga ||
        f.properties?.NAME_2 ||
        f.properties?.local_gov_;
      const fWard =
        f.properties?.ward_name || f.properties?.ward || f.properties?.NAME_3;

      if (activeState && activeLga && wardsGeoJson) {
        rec = wardRecordsMap.get(
          `${normUpper(fState)}||${normUpper(fLga)}||${normUpper(fWard)}`,
        );
      } else if (activeState && lgasGeoJson) {
        rec = lgaRecordsMap.get(`${normUpper(fState)}||${normUpper(fLga)}`);
      } else {
        if (MDP_STATES.has(normUpper(fState))) {
          rec = stateRecordsMap.get(normUpper(fState));
        }
      }
      if (rec) {
        values.push(activeMetric.getValue(rec));
      }
    });

    if (values.length === 0) return { min: 0, max: 100 };
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [
    filteredGeoJson,
    activeState,
    activeLga,
    activeMetric,
    stateRecordsMap,
    lgaRecordsMap,
    wardRecordsMap,
    lgasGeoJson,
    wardsGeoJson,
  ]);

  const getFeatureStyle = (f: any) => {
    const fState =
      f.properties?.state_name ||
      f.properties?.state ||
      f.properties?.NAME_1 ||
      f.properties?.admin1Name;
    const sUpper = normUpper(fState);

    if (!activeState) {
      if (!MDP_STATES.has(sUpper)) {
        return {
          fillColor: isDark ? "#2D3748" : "#E2E8F0",
          fillOpacity: 0.6,
          color: isDark ? "#4A5568" : "#CBD5E0",
          weight: 1,
        };
      }
    }

    let rec: GeoRecord | undefined;
    const fLga =
      f.properties?.lga_name ||
      f.properties?.lga ||
      f.properties?.NAME_2 ||
      f.properties?.local_gov_;
    const fWard =
      f.properties?.ward_name || f.properties?.ward || f.properties?.NAME_3;

    if (activeState && activeLga && wardsGeoJson) {
      rec = wardRecordsMap.get(
        `${normUpper(fState)}||${normUpper(fLga)}||${normUpper(fWard)}`,
      );
    } else if (activeState && lgasGeoJson) {
      rec = lgaRecordsMap.get(`${normUpper(fState)}||${normUpper(fLga)}`);
    } else {
      rec = stateRecordsMap.get(sUpper);
    }

    if (!rec) {
      return {
        fillColor: isDark ? "#1A202C" : "#F7FAFC",
        fillOpacity: 0.4,
        color: isDark ? "#4A5568" : "#E2E8F0",
        weight: 1.5,
      };
    }

    const val = activeMetric.getValue(rec);
    const range = valueRange.max - valueRange.min;
    const ratio = range > 0 ? (val - valueRange.min) / range : 0.5;
    const fillColor = activeMetric.colorScale(ratio);

    return {
      fillColor,
      fillOpacity: 0.85,
      color: isDark ? "#1A202C" : "#FFFFFF",
      weight: 1.5,
    };
  };

  const onEachFeature = (f: any, layer: L.Layer) => {
    const fState =
      f.properties?.state_name ||
      f.properties?.state ||
      f.properties?.NAME_1 ||
      f.properties?.admin1Name;
    const sUpper = normUpper(fState);

    let rec: GeoRecord | undefined;
    const fLga =
      f.properties?.lga_name ||
      f.properties?.lga ||
      f.properties?.NAME_2 ||
      f.properties?.local_gov_;
    const fWard =
      f.properties?.ward_name || f.properties?.ward || f.properties?.NAME_3;

    let displayName = fState;

    if (activeState && activeLga && wardsGeoJson) {
      rec = wardRecordsMap.get(
        `${normUpper(fState)}||${normUpper(fLga)}||${normUpper(fWard)}`,
      );
      displayName = `Ward: ${fWard}`;
    } else if (activeState && lgasGeoJson) {
      rec = lgaRecordsMap.get(`${normUpper(fState)}||${normUpper(fLga)}`);
      displayName = `LGA: ${fLga}`;
    } else {
      rec = stateRecordsMap.get(sUpper);
      displayName = `State: ${fState}`;
    }

    let tooltipContent = `<div style="font-weight:600; font-size:12px;">${displayName}</div>`;

    if (!activeState && !MDP_STATES.has(sUpper)) {
      tooltipContent += `<div style="color:gray; font-size:11px; margin-top:2px;">Non-Pilot State</div>`;
    } else if (rec) {
      const val = activeMetric.getValue(rec);
      tooltipContent += `<div style="margin-top:4px; font-size:11px;">
        <span style="color:#718096;">${activeMetric.label}:</span> 
        <strong style="color:${isDark ? "#FFF" : "#1A202C"};">${activeMetric.format(val)}</strong>
      </div>`;
    } else {
      tooltipContent += `<div style="color:gray; font-size:11px; margin-top:2px;">No Data Available</div>`;
    }

    layer.bindTooltip(tooltipContent, {
      sticky: true,
      direction: "auto",
      className: "custom-map-tooltip",
    });

    layer.on({
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({
          fillOpacity: 0.95,
          weight: 2.5,
          color: "#128C7E",
        });
      },
      mouseout: (e) => {
        const l = e.target;
        l.setStyle(getFeatureStyle(f));
      },
      click: () => {
        if (!activeState) {
          if (MDP_STATES.has(sUpper)) {
            handleNav({ state: fState });
          }
        } else if (!activeLga) {
          handleNav({ state: path.state || fState, lga: fLga });
        } else {
          handleNav({ state: path.state, lga: path.lga, ward: fWard });
        }
      },
    });
  };

  const handleReset = (level: "national" | "state") => {
    if (level === "national") {
      handleNav({});
    } else if (level === "state") {
      handleNav({ state: path.state });
    }
  };

  return (
    <div className="space-y-2">
      <style>{`
        .custom-map-tooltip {
          background: ${isDark ? "#1F2937" : "#FFFFFF"} !important;
          color: ${isDark ? "#F9FAFB" : "#111827"} !important;
          border: 1px solid ${isDark ? "#374151" : "#E5E7EB"} !important;
          border-radius: 0.375rem !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
          padding: 8px 12px !important;
          font-family: inherit !important;
        }
        .leaflet-container {
          background: transparent !important;
        }
      `}</style>

      <div className="flex items-center justify-between text-xs font-semibold py-1">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleReset("national")}
            className={`hover:underline ${!path.state ? "text-brand-600 font-bold" : "text-ink-muted"}`}
          >
            National
          </button>
          {path.state && (
            <>
              <span className="text-ink-muted">/</span>
              <button
                onClick={() => handleReset("state")}
                className={`hover:underline ${!path.lga ? "text-brand-600 font-bold" : "text-ink-muted"}`}
              >
                {path.state}
              </button>
            </>
          )}
          {path.lga && (
            <>
              <span className="text-ink-muted">/</span>
              <span className="text-brand-600 font-bold">{path.lga}</span>
            </>
          )}
        </div>
        <div className="text-[11px] text-ink-muted italic font-normal">
          Click map to drill down
        </div>
      </div>

      <div
        style={{ height, width: "100%", position: "relative" }}
        className="rounded-xl border border-line-light dark:border-line-dark overflow-hidden bg-slate-50 dark:bg-[#0f172a]"
      >
        {filteredGeoJson ? (
          <MapContainer
            bounds={mapBounds || NIGERIA_BOUNDS}
            zoomControl={false}
            scrollWheelZoom={true}
            doubleClickZoom={false}
            dragging={true}
            style={{ height: "100%", width: "100%" }}
            attributionControl={false}
          >
            <MapBoundsController bounds={mapBounds} />
            <InvalidateOnMount />
            <GeoJSON
              key={`${metric}-${activeState || "national"}-${activeLga || "lga"}-${filteredGeoJson.features?.length || 0}`}
              data={filteredGeoJson}
              style={getFeatureStyle}
              onEachFeature={onEachFeature}
            />
          </MapContainer>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-ink-muted">
            Loading geographical boundary vectors...
          </div>
        )}
      </div>
    </div>
  );
};

export default DrilldownMap;
