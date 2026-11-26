import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Layers,
  MapPin,
  Users,
  Home,
  Compass,
  CheckCircle2,
} from "lucide-react";
import type { DrilldownPath, DomainId, GeoRecord } from "../types";

export interface DrilldownMapProps {
  drilldown: DrilldownPath;
  onDrilldownChange?: (path: DrilldownPath) => void;
  domain?: DomainId;
  record?: GeoRecord;
  currentRecord?: GeoRecord;
  selectedState?: string | null;
  selectedLga?: string | null;
  states?: GeoRecord[];
  communities?: GeoRecord[];
  onSelectLocation?: (name: string, level: any) => void;
  isDark?: boolean;
}

// 4 UNICEF Pilot States Baseline Metrics
const PILOT_STATES: Record<
  string,
  {
    name: string;
    hh: number;
    ind: number;
    male: number;
    female: number;
    center: [number, number];
    zoom: number;
  }
> = {
  ABIA: {
    name: "Abia",
    hh: 9842,
    ind: 31820,
    male: 16100,
    female: 15720,
    center: [5.4527, 7.5248],
    zoom: 9,
  },
  BENUE: {
    name: "Benue",
    hh: 11430,
    ind: 39114,
    male: 19850,
    female: 19264,
    center: [7.3369, 8.7404],
    zoom: 8,
  },
  OYO: {
    name: "Oyo",
    hh: 10120,
    ind: 33640,
    male: 17042,
    female: 16598,
    center: [8.1574, 3.6147],
    zoom: 8,
  },
  SOKOTO: {
    name: "Sokoto",
    hh: 10120,
    ind: 34102,
    male: 17320,
    female: 16782,
    center: [13.0609, 5.2476],
    zoom: 8,
  },
};

const NATIONAL_TOTALS = {
  hh: 41512,
  ind: 138676,
  male: 70312,
  female: 68364,
};

export const DrilldownMap: React.FC<DrilldownMapProps> = ({
  drilldown,
  onDrilldownChange,
  record,
  currentRecord,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  const [hoveredEntity, setHoveredEntity] = useState<{
    name: string;
    level: string;
    hh: number;
    ind: number;
    male: number;
    female: number;
    isPilot: boolean;
  } | null>(null);

  const [isLoadingGeoJson, setIsLoadingGeoJson] = useState<boolean>(false);

  const normalize = (val?: string | null): string =>
    val ? String(val).trim().toUpperCase() : "";

  // 1. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        attributionControl: false,
        zoomControl: false,
        minZoom: 5,
        maxZoom: 14,
        maxBounds: [
          [3.0, 2.0],
          [15.0, 15.5],
        ],
      }).setView([9.082, 8.6753], 6);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Fetch and render appropriate GeoJSON based on active drilldown hierarchy
  const loadBoundaries = useCallback(async () => {
    const currentMap = mapInstanceRef.current;
    if (!currentMap) return;

    setIsLoadingGeoJson(true);

    if (geoJsonLayerRef.current) {
      if (currentMap.hasLayer(geoJsonLayerRef.current)) {
        currentMap.removeLayer(geoJsonLayerRef.current);
      }
      geoJsonLayerRef.current = null;
    }

    const activeState = normalize(drilldown.state);
    const activeLga = normalize(drilldown.lga);

    let geoJsonUrl = "/geojson/nigeria-states.json";
    let targetLevel: "state" | "lga" | "ward" = "state";

    if (activeLga) {
      geoJsonUrl = "/geojson/nigeria_ward.json";
      targetLevel = "ward";
    } else if (activeState) {
      geoJsonUrl = "/geojson/nigeria_lga.json";
      targetLevel = "lga";
    }

    try {
      const response = await fetch(geoJsonUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to load ${geoJsonUrl}: status ${response.status}`,
        );
      }
      const rawData = await response.json();

      let filteredFeatures = rawData.features || [];

      if (targetLevel === "lga" && activeState) {
        filteredFeatures = filteredFeatures.filter((f: any) => {
          const st = normalize(
            f.properties.state_name ||
              f.properties.statename ||
              f.properties.STATE ||
              f.properties.State ||
              f.properties.admin1Pcod,
          );
          return (
            st === activeState ||
            st.includes(activeState) ||
            activeState.includes(st)
          );
        });
      } else if (targetLevel === "ward" && activeLga) {
        filteredFeatures = filteredFeatures.filter((f: any) => {
          const lga = normalize(
            f.properties.lga_name ||
              f.properties.lganame ||
              f.properties.LGA ||
              f.properties.admin2Name,
          );
          return (
            lga === activeLga ||
            lga.includes(activeLga) ||
            activeLga.includes(lga)
          );
        });
      }

      const filteredGeoJson = {
        type: "FeatureCollection",
        features: filteredFeatures,
      };

      const newLayer = L.geoJSON(filteredGeoJson as any, {
        style: (feature) => {
          if (!feature) return {};
          const name = normalize(
            feature.properties.state_name ||
              feature.properties.statename ||
              feature.properties.STATE ||
              feature.properties.State ||
              feature.properties.lga_name ||
              feature.properties.LGA ||
              feature.properties.ward_name ||
              feature.properties.WardName ||
              "",
          );

          const isPilot = Boolean(PILOT_STATES[name]) || activeState !== "";

          if (isPilot) {
            return {
              fillColor: "#2DD4BF",
              weight: 1.8,
              opacity: 0.95,
              color: "#5EEAD4",
              dashArray: "",
              fillOpacity: 0.82,
            };
          }

          return {
            fillColor: "#0F2422",
            weight: 1,
            opacity: 0.6,
            color: "#1E3A36",
            dashArray: "3",
            fillOpacity: 0.5,
          };
        },
        onEachFeature: (feature, layer) => {
          const p = feature.properties || {};
          const name =
            p.state_name ||
            p.statename ||
            p.STATE ||
            p.State ||
            p.lga_name ||
            p.lganame ||
            p.LGA ||
            p.ward_name ||
            p.WardName ||
            "Unknown Area";

          const normalizedName = normalize(name);
          const isPilot = Boolean(PILOT_STATES[normalizedName]);

          layer.on({
            mouseover: (e) => {
              const currentLyr = e.target;
              currentLyr.setStyle({
                weight: 3,
                color: "#FFFFFF",
                fillColor: "#38BDF8",
                fillOpacity: 0.95,
              });
              if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                currentLyr.bringToFront();
              }

              const pilotData = PILOT_STATES[normalizedName];
              setHoveredEntity({
                name,
                level: targetLevel.toUpperCase(),
                hh: pilotData
                  ? pilotData.hh
                  : Math.round(NATIONAL_TOTALS.hh / 36),
                ind: pilotData
                  ? pilotData.ind
                  : Math.round(NATIONAL_TOTALS.ind / 36),
                male: pilotData
                  ? pilotData.male
                  : Math.round(NATIONAL_TOTALS.male / 36),
                female: pilotData
                  ? pilotData.female
                  : Math.round(NATIONAL_TOTALS.female / 36),
                isPilot,
              });
            },
            mouseout: (e) => {
              if (geoJsonLayerRef.current) {
                geoJsonLayerRef.current.resetStyle(e.target);
              }
              setHoveredEntity(null);
            },
            click: () => {
              if (targetLevel === "state" && isPilot) {
                onDrilldownChange?.({
                  state: name,
                  lga: null,
                  ward: null,
                  community: null,
                });
              } else if (targetLevel === "lga") {
                onDrilldownChange?.({
                  state: drilldown.state ?? null,
                  lga: name,
                  ward: null,
                  community: null,
                });
              } else if (targetLevel === "ward") {
                onDrilldownChange?.({
                  state: drilldown.state ?? null,
                  lga: drilldown.lga ?? null,
                  ward: name,
                  community: null,
                });
              }
            },
          });
        },
      });

      const activeMap = mapInstanceRef.current;
      if (!activeMap) return;

      newLayer.addTo(activeMap);
      geoJsonLayerRef.current = newLayer;

      if (filteredFeatures.length > 0) {
        const bounds = newLayer.getBounds();
        if (bounds.isValid()) {
          activeMap.fitBounds(bounds, { padding: [24, 24], maxZoom: 11 });
        }
      } else if (!activeState) {
        activeMap.setView([9.082, 8.6753], 6);
      }
    } catch (err) {
      console.error("Error loading GeoJSON boundaries:", err);
    } finally {
      setIsLoadingGeoJson(false);
    }
  }, [drilldown.state, drilldown.lga, onDrilldownChange]);

  useEffect(() => {
    loadBoundaries();
  }, [loadBoundaries]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleResetNational = () => {
    onDrilldownChange?.({
      state: null,
      lga: null,
      ward: null,
      community: null,
    });
    mapInstanceRef.current?.setView([9.082, 8.6753], 6);
  };

  const handleSelectPilotState = (stateKey: string) => {
    const pilot = PILOT_STATES[stateKey];
    if (pilot) {
      onDrilldownChange?.({
        state: pilot.name,
        lga: null,
        ward: null,
        community: null,
      });
    }
  };

  const activeLevelName = drilldown.ward
    ? `Ward: ${drilldown.ward}`
    : drilldown.lga
      ? `LGA: ${drilldown.lga}`
      : drilldown.state
        ? `State: ${drilldown.state}`
        : "National Pilot Scope (4 States)";

  const activeLevelBadge = drilldown.ward
    ? "WARD LEVEL"
    : drilldown.lga
      ? "LGA LEVEL"
      : drilldown.state
        ? "STATE LEVEL"
        : "NATIONAL LEVEL";

  const selectedPilotKey = normalize(drilldown.state);
  const currentPilot = PILOT_STATES[selectedPilotKey];
  const activeRecordData = currentRecord || record;

  const hudHouseholds = hoveredEntity
    ? hoveredEntity.hh
    : currentPilot
      ? currentPilot.hh
      : activeRecordData?.total_households || NATIONAL_TOTALS.hh;

  const hudIndividuals = hoveredEntity
    ? hoveredEntity.ind
    : currentPilot
      ? currentPilot.ind
      : activeRecordData?.total_individuals || NATIONAL_TOTALS.ind;

  const hudMale = hoveredEntity
    ? hoveredEntity.male
    : currentPilot
      ? currentPilot.male
      : activeRecordData?.male_individuals || NATIONAL_TOTALS.male;

  const hudFemale = hoveredEntity
    ? hoveredEntity.female
    : currentPilot
      ? currentPilot.female
      : activeRecordData?.female_individuals || NATIONAL_TOTALS.female;

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-emerald-900/40 shadow-2xl bg-[#081514]">
      {/* 1. Real Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-[#081514]" />

      {/* 2. Spatial layer breadcrumbs & pilot chips */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 max-w-[85%]">
        <div className="flex items-center gap-2 bg-[#0a1f1d]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-emerald-700/40 shadow-lg">
          <Layers className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-semibold text-slate-300">
            Spatial Layer:
          </span>
          <span className="text-xs font-bold text-teal-300 tracking-wide uppercase">
            {activeLevelBadge}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-xs font-medium text-slate-200 truncate">
            {hoveredEntity ? hoveredEntity.name : activeLevelName}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={handleResetNational}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all border ${
              !drilldown.state
                ? "bg-teal-500 text-slate-950 border-teal-400 shadow-md font-bold"
                : "bg-[#0a1f1d]/85 text-slate-300 border-emerald-900/60 hover:bg-emerald-900/40 hover:text-white"
            }`}
          >
            All 4 Pilots
          </button>
          {Object.keys(PILOT_STATES).map((key) => {
            const isSelected = selectedPilotKey === key;
            return (
              <button
                key={key}
                onClick={() => handleSelectPilotState(key)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all border flex items-center gap-1 ${
                  isSelected
                    ? "bg-teal-500 text-slate-950 border-teal-300 shadow-md font-bold"
                    : "bg-[#0a1f1d]/85 text-slate-300 border-emerald-900/60 hover:bg-emerald-900/40 hover:text-white"
                }`}
              >
                {isSelected && (
                  <CheckCircle2 className="w-3 h-3 text-slate-950" />
                )}
                {PILOT_STATES[key].name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Map Control Buttons */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleResetNational}
          title="Reset to National Pilot View"
          className="p-2.5 bg-[#0a1f1d]/90 hover:bg-emerald-800/80 text-teal-300 hover:text-white rounded-xl border border-emerald-700/50 shadow-lg transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-2.5 bg-[#0a1f1d]/90 hover:bg-emerald-800/80 text-teal-300 hover:text-white rounded-xl border border-emerald-700/50 shadow-lg transition-all"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-2.5 bg-[#0a1f1d]/90 hover:bg-emerald-800/80 text-teal-300 hover:text-white rounded-xl border border-emerald-700/50 shadow-lg transition-all"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* 4. Floating HUD Card */}
      <div className="absolute bottom-4 left-4 z-10 bg-[#061413]/95 backdrop-blur-md p-4 rounded-2xl border border-emerald-700/50 shadow-2xl min-w-[280px] max-w-[340px]">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-emerald-800/40">
          <div className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold text-slate-100 uppercase tracking-wide">
              {hoveredEntity ? hoveredEntity.level : activeLevelBadge}
            </span>
          </div>
          <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60">
            {hoveredEntity?.isPilot || !hoveredEntity
              ? "Pilot Scope"
              : "Non-Pilot"}
          </span>
        </div>

        <div className="text-sm font-bold text-white mb-3 truncate">
          {hoveredEntity ? hoveredEntity.name : activeLevelName}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-[#0b2422]/80 p-2.5 rounded-xl border border-emerald-800/30">
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-300 mb-0.5">
              <Home className="w-3 h-3 text-teal-400" />
              <span>Households</span>
            </div>
            <div className="text-base font-extrabold text-teal-300">
              {hudHouseholds.toLocaleString()}
            </div>
          </div>

          <div className="bg-[#0b2422]/80 p-2.5 rounded-xl border border-emerald-800/30">
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-300 mb-0.5">
              <Users className="w-3 h-3 text-emerald-400" />
              <span>Individuals</span>
            </div>
            <div className="text-base font-extrabold text-emerald-300">
              {hudIndividuals.toLocaleString()}
            </div>
          </div>

          <div className="bg-[#0b2422]/80 p-2.5 rounded-xl border border-emerald-800/30">
            <div className="text-[11px] font-medium text-slate-300 mb-0.5">
              Male
            </div>
            <div className="text-sm font-bold text-slate-100">
              {hudMale.toLocaleString()}
            </div>
          </div>

          <div className="bg-[#0b2422]/80 p-2.5 rounded-xl border border-emerald-800/30">
            <div className="text-[11px] font-medium text-slate-300 mb-0.5">
              Female
            </div>
            <div className="text-sm font-bold text-slate-100">
              {hudFemale.toLocaleString()}
            </div>
          </div>
        </div>

        {drilldown.state && (
          <button
            onClick={handleResetNational}
            className="w-full mt-3 py-1.5 text-xs font-semibold text-teal-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/50 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <MapPin className="w-3 h-3" />
            Back to National View
          </button>
        )}
      </div>

      {/* 5. Legend */}
      <div className="absolute bottom-4 right-4 z-10 bg-[#061413]/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-emerald-800/40 shadow-xl flex items-center gap-4 text-xs font-medium text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#2DD4BF] border border-[#5EEAD4] shadow-sm" />
          <span>4 Pilot States</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#0F2422] border border-[#1E3A36]" />
          <span>Non-Pilot</span>
        </div>
      </div>

      {/* 6. GeoJSON loading spinner */}
      {isLoadingGeoJson && (
        <div className="absolute inset-0 z-20 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center">
          <div className="bg-[#0a1f1d] px-4 py-2.5 rounded-xl border border-teal-500/40 text-teal-300 text-xs font-bold flex items-center gap-2 shadow-xl animate-pulse">
            <RotateCcw className="w-3.5 h-3.5 animate-spin" />
            Rendering Boundary Layer...
          </div>
        </div>
      )}
    </div>
  );
};

export default DrilldownMap;
