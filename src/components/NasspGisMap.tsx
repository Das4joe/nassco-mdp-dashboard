import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  fetchGeoJson,
  getStateSummary,
  type GeoLevel,
} from "../services/dataService";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShieldCheck,
  Activity,
} from "lucide-react";

interface NasspGisMapProps {
  selectedState?: string;
  selectedLga?: string;
  onStateSelect: (stateName: string) => void;
  onLgaSelect: (lgaName: string) => void;
  onReset: () => void;
  isDarkMode?: boolean;
}

export const NasspGisMap: React.FC<NasspGisMapProps> = ({
  selectedState,
  selectedLga,
  onStateSelect,
  onLgaSelect,
  onReset,
  isDarkMode = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  const [currentLevel, setCurrentLevel] = useState<GeoLevel>("national");
  const [activeRegionName, setActiveRegionName] = useState<string>(
    "National (4 Pilot States)",
  );
  const [hoveredFeature, setHoveredFeature] = useState<{
    name: string;
    isPilot: boolean;
    hhs?: number;
    inds?: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const PILOT_STATES = ["Abia", "Benue", "Oyo", "Sokoto"];

  // Initialize pure vector Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [9.082, 8.6753],
      zoom: 6,
      minZoom: 5,
      maxZoom: 12,
      zoomControl: false,
      attributionControl: false,
      doubleClickZoom: false,
    });

    mapInstanceRef.current = map;

    // Trigger size validation after mount
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Render vector boundaries whenever level or selection changes
  const renderVectorLayer = useCallback(async () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    setIsLoading(true);

    try {
      if (geoJsonLayerRef.current) {
        map.removeLayer(geoJsonLayerRef.current);
        geoJsonLayerRef.current = null;
      }

      const targetLevel: GeoLevel = selectedState ? "lga" : "state";
      const geoData = await fetchGeoJson(targetLevel, selectedState);

      const geoJsonLayer = L.geoJSON(geoData, {
        style: (feature) => {
          const props = feature?.properties || {};
          const name =
            props.admin1Name ||
            props.state_name ||
            props.NAME_1 ||
            props.statename ||
            props.State ||
            props.admin2Name ||
            props.lga_name ||
            props.LGA ||
            "";
          const isPilot =
            PILOT_STATES.some((p) => p.toLowerCase() === name.toLowerCase()) ||
            props.isPilot === true ||
            !!selectedState;
          const isSelected =
            (selectedState &&
              name.toLowerCase() === selectedState.toLowerCase()) ||
            (selectedLga && name.toLowerCase() === selectedLga.toLowerCase());

          if (isDarkMode) {
            // Dark Mode Theme (NASSP Green vs Deep Slate)
            if (isSelected) {
              return {
                fillColor: "#10b981",
                fillOpacity: 0.85,
                color: "#34d399",
                weight: 2.5,
                opacity: 1,
              };
            }
            if (isPilot) {
              return {
                fillColor: "#059669",
                fillOpacity: 0.65,
                color: "#10b981",
                weight: 1.8,
                opacity: 1,
              };
            }
            return {
              fillColor: "#132c26",
              fillOpacity: 0.45,
              color: "#1e483e",
              weight: 1.0,
              opacity: 0.8,
            };
          } else {
            // Light Mode Theme (High Contrast Emerald vs Crisp Slate)
            if (isSelected) {
              return {
                fillColor: "#059669",
                fillOpacity: 0.85,
                color: "#047857",
                weight: 2.5,
                opacity: 1,
              };
            }
            if (isPilot) {
              return {
                fillColor: "#10b981",
                fillOpacity: 0.6,
                color: "#059669",
                weight: 2.0,
                opacity: 1,
              };
            }
            return {
              fillColor: "#e2e8f0",
              fillOpacity: 0.65,
              color: "#94a3b8",
              weight: 1.0,
              opacity: 0.9,
            };
          }
        },
        onEachFeature: (feature, layer) => {
          const props = feature?.properties || {};
          const name =
            props.admin1Name ||
            props.state_name ||
            props.NAME_1 ||
            props.statename ||
            props.State ||
            props.admin2Name ||
            props.lga_name ||
            props.LGA ||
            "Unknown";
          const isPilot =
            PILOT_STATES.some((p) => p.toLowerCase() === name.toLowerCase()) ||
            props.isPilot === true ||
            !!selectedState;

          layer.on({
            mouseover: () => {
              setHoveredFeature({
                name,
                isPilot,
                hhs: props.households,
                inds: props.individuals,
              });
              if ("setStyle" in layer) {
                (layer as L.Path).setStyle({
                  weight: 3,
                  color: isDarkMode ? "#6ee7b7" : "#047857",
                  fillOpacity: isDarkMode ? 0.9 : 0.85,
                });
              }
            },
            mouseout: () => {
              setHoveredFeature(null);
              if (geoJsonLayerRef.current) {
                geoJsonLayerRef.current.resetStyle(layer as L.Path);
              }
            },
            click: () => {
              if (!selectedState) {
                // Clicking a state at national view
                if (isPilot) {
                  onStateSelect(name);
                }
              } else {
                // Clicking an LGA at state view
                onLgaSelect(name);
              }
            },
          });
        },
      }).addTo(map);

      geoJsonLayerRef.current = geoJsonLayer;

      // Smooth zoom to bounds
      const bounds = geoJsonLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [20, 20],
          maxZoom: selectedState ? 9 : 7,
        });
      }

      setCurrentLevel(
        selectedState ? (selectedLga ? "lga" : "state") : "national",
      );
      setActiveRegionName(
        selectedLga
          ? `${selectedLga} LGA, ${selectedState}`
          : selectedState || "National (4 Pilot States)",
      );
    } catch (err) {
      console.error("[NasspGisMap] Error rendering vector boundaries:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedState, selectedLga, isDarkMode, onStateSelect, onLgaSelect]);

  useEffect(() => {
    renderVectorLayer();
  }, [renderVectorLayer]);

  // Window resize handler to maintain vector crispness
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  const currentSummary = getStateSummary(selectedState);

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-xl overflow-hidden border dark:border-[#1a3d36] border-slate-200 dark:bg-[#071311] bg-slate-50 shadow-sm flex flex-col">
      {/* Map Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 dark:bg-[#0c221e] bg-white border-b dark:border-[#1a3d36] border-slate-200 z-10">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 dark:text-emerald-400 text-emerald-600" />
          <span className="text-xs font-bold uppercase tracking-wider dark:text-slate-200 text-slate-800">
            Geographic Coverage & Administrative Morphing
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full dark:bg-[#143830] bg-emerald-50 dark:text-emerald-300 text-emerald-800 uppercase tracking-wider border dark:border-emerald-800/40 border-emerald-200">
            {currentLevel === "national"
              ? "National Level"
              : currentLevel === "state"
                ? "State Drilldown"
                : "LGA Drilldown"}
          </span>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div
        ref={mapContainerRef}
        className="flex-1 w-full h-full relative cursor-crosshair z-0"
      />

      {/* Floating HUD Card (Top Left) */}
      <div className="absolute top-12 left-3 z-[400] max-w-[220px] dark:bg-[#0c221ebf] bg-white/95 backdrop-blur-md rounded-lg p-3 border dark:border-[#1a3d36] border-slate-200 shadow-md">
        <div className="flex items-center space-x-1.5 mb-1.5">
          <ShieldCheck className="w-4 h-4 dark:text-emerald-400 text-emerald-600 flex-shrink-0" />
          <h4 className="text-xs font-bold dark:text-white text-slate-900 truncate">
            {activeRegionName}
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t dark:border-slate-800 border-slate-100">
          <div>
            <span className="text-[10px] uppercase dark:text-slate-400 text-slate-500 block">
              Households
            </span>
            <span className="font-extrabold dark:text-emerald-400 text-emerald-700">
              {currentSummary.households.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase dark:text-slate-400 text-slate-500 block">
              Individuals
            </span>
            <span className="font-extrabold dark:text-teal-400 text-teal-700">
              {currentSummary.individuals.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase dark:text-slate-400 text-slate-500 block">
              Children (0-17)
            </span>
            <span className="font-extrabold dark:text-amber-400 text-amber-700">
              {currentSummary.children.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase dark:text-slate-400 text-slate-500 block">
              Communities
            </span>
            <span className="font-extrabold dark:text-cyan-400 text-cyan-700">
              {currentSummary.communities.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Hover Info Tooltip (Bottom Left) */}
      {hoveredFeature && (
        <div className="absolute bottom-12 left-3 z-[400] dark:bg-[#081815e6] bg-white/95 backdrop-blur-md rounded-lg px-3 py-1.5 border dark:border-emerald-600/50 border-emerald-500 shadow-md text-[11px]">
          <span className="font-bold dark:text-white text-slate-900">
            {hoveredFeature.name}
          </span>
          {hoveredFeature.isPilot ? (
            <span className="ml-1.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              Pilot Area
            </span>
          ) : (
            <span className="ml-1.5 text-[10px] dark:text-slate-400 text-slate-500">
              Non-Pilot
            </span>
          )}
        </div>
      )}

      {/* Map Control Buttons (Top Right) */}
      <div className="absolute top-12 right-3 z-[400] flex flex-col space-y-1.5">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-1.5 rounded-md dark:bg-[#0c221e] bg-white border dark:border-[#1a3d36] border-slate-200 dark:text-slate-200 text-slate-700 hover:dark:bg-[#13332c] hover:bg-slate-100 shadow-sm transition-colors"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-1.5 rounded-md dark:bg-[#0c221e] bg-white border dark:border-[#1a3d36] border-slate-200 dark:text-slate-200 text-slate-700 hover:dark:bg-[#13332c] hover:bg-slate-100 shadow-sm transition-colors"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        {selectedState && (
          <button
            onClick={onReset}
            title="Reset to National"
            className="p-1.5 rounded-md dark:bg-emerald-950 bg-emerald-50 border border-emerald-600/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 shadow-sm transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Slim Compact Legend (Bottom Right) */}
      <div className="absolute bottom-3 right-3 z-[400] dark:bg-[#0c221ebf] bg-white/95 backdrop-blur-md rounded-md px-3 py-1.5 border dark:border-[#1a3d36] border-slate-200 shadow-sm flex items-center space-x-3 text-[10px] font-medium">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 inline-block shadow-sm" />
          <span className="dark:text-slate-200 text-slate-700 font-semibold">
            {selectedState ? "Targeted Pilot LGAs" : "Targeted Pilot States"}
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full dark:bg-[#132c26] bg-slate-300 inline-block border dark:border-slate-700 border-slate-400" />
          <span className="dark:text-slate-400 text-slate-500">
            Non-Pilot States
          </span>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-[500] dark:bg-[#071311a6] bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full dark:bg-[#0c221e] bg-white border dark:border-emerald-700 border-emerald-300 shadow-md">
            <div className="w-3 h-3 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
            <span className="text-xs font-semibold dark:text-emerald-400 text-emerald-700">
              Loading Vectors...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
