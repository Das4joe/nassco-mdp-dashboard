import React, { useEffect, useState, useRef } from "react";
import { MapContainer, GeoJSON, useMap } from "react-leaflet";
import type { FeatureCollection } from "geojson";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fetchGeoJson } from "../services/dataService";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export interface NasspGisMapProps {
  selectedState?: string | null;
  selectedLga?: string | null;
  selectedWard?: string | null;
  onSelectState: (state: string | null) => void;
  onSelectLga: (lga: string | null) => void;
  onSelectWard?: (ward: string | null) => void;
  isDark?: boolean;
}

function MapController({
  bounds,
}: {
  bounds: L.LatLngBoundsExpression | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, {
        padding: [25, 25],
        maxZoom: 14,
        animate: true,
        duration: 0.8,
      });
    }
  }, [bounds, map]);
  return null;
}

export const NasspGisMap: React.FC<NasspGisMapProps> = ({
  selectedState = null,
  selectedLga = null,
  selectedWard = null,
  onSelectState,
  onSelectLga,
  onSelectWard,
  isDark = true,
}) => {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [mapBounds, setMapBounds] = useState<L.LatLngBoundsExpression | null>(
    null,
  );
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const currentLevel: "national" | "state" | "lga" | "ward" = selectedWard
    ? "ward"
    : selectedLga
      ? "lga"
      : selectedState
        ? "state"
        : "national";

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        let data: FeatureCollection;
        if (selectedLga) {
          data = await fetchGeoJson("ward", selectedLga, selectedState);
        } else if (selectedState) {
          data = await fetchGeoJson("lga", selectedState);
        } else {
          data = await fetchGeoJson("national");
        }

        if (isMounted) {
          setGeoData(data);
          setLoading(false);

          if (data && data.features && data.features.length > 0) {
            try {
              const geoJsonLayer = L.geoJSON(data);
              const b = geoJsonLayer.getBounds();
              if (b.isValid()) {
                setMapBounds(b);
              }
            } catch (err) {
              console.warn("Bounds error:", err);
            }
          }
        }
      } catch (e) {
        console.error("Map loading error:", e);
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [selectedState, selectedLga]);

  const getFeatureStyle = (feature: any) => {
    const props = feature?.properties || {};
    const stateName = (
      props.state ||
      props.NAME_1 ||
      props.name ||
      ""
    ).toLowerCase();
    const lgaName = (
      props.lga ||
      props.NAME_2 ||
      props.admin2Name ||
      props.name ||
      ""
    ).toLowerCase();
    const wardName = (
      props.ward ||
      props.ward_name ||
      props.NAME_3 ||
      props.name ||
      ""
    ).toLowerCase();

    const isPilot =
      ["abia", "benue", "oyo", "sokoto"].includes(stateName) || props.isPilot;
    const isCurrentHovered =
      hoveredFeature &&
      (hoveredFeature.toLowerCase() === stateName ||
        hoveredFeature.toLowerCase() === lgaName ||
        hoveredFeature.toLowerCase() === wardName);

    const isSelectedWard =
      selectedWard && wardName === selectedWard.toLowerCase();

    if (currentLevel === "national") {
      if (isPilot) {
        return {
          fillColor: isCurrentHovered ? "#10b981" : "#059669",
          fillOpacity: isDark
            ? isCurrentHovered
              ? 0.75
              : 0.6
            : isCurrentHovered
              ? 0.8
              : 0.65,
          weight: isCurrentHovered ? 2.5 : 1.8,
          color: isDark ? "#34d399" : "#047857",
        };
      }
      return {
        fillColor: isDark ? "#0f1f1d" : "#e2e8f0",
        fillOpacity: isDark ? 0.35 : 0.45,
        weight: 0.8,
        color: isDark ? "#1e3a34" : "#cbd5e1",
      };
    }

    if (currentLevel === "state") {
      return {
        fillColor: isCurrentHovered ? "#10b981" : "#059669",
        fillOpacity: isDark
          ? isCurrentHovered
            ? 0.8
            : 0.55
          : isCurrentHovered
            ? 0.85
            : 0.65,
        weight: isCurrentHovered ? 2.2 : 1.4,
        color: isDark ? "#34d399" : "#065f46",
      };
    }

    return {
      fillColor: isSelectedWard
        ? "#f59e0b"
        : isCurrentHovered
          ? "#10b981"
          : "#0d9488",
      fillOpacity: isSelectedWard
        ? 0.85
        : isDark
          ? isCurrentHovered
            ? 0.75
            : 0.5
          : isCurrentHovered
            ? 0.8
            : 0.6,
      weight: isSelectedWard ? 2.5 : isCurrentHovered ? 2.0 : 1.2,
      color: isSelectedWard ? "#fbbf24" : isDark ? "#2dd4bf" : "#0f766e",
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const props = feature?.properties || {};
    const stateName = props.state || props.NAME_1 || props.name || "";
    const lgaName =
      props.lga || props.NAME_2 || props.admin2Name || props.name || "";
    const wardName =
      props.ward || props.ward_name || props.NAME_3 || props.name || "";
    const isPilot =
      ["abia", "benue", "oyo", "sokoto"].includes(stateName.toLowerCase()) ||
      props.isPilot;

    let tooltipContent = "";
    if (currentLevel === "national") {
      tooltipContent = `<strong>${stateName}</strong><br/>${isPilot ? "Targeted Pilot State" : "Non-Pilot State"}`;
    } else if (currentLevel === "state") {
      tooltipContent = `<strong>${lgaName} LGA</strong><br/>Click to drill down into Wards`;
    } else {
      tooltipContent = `<strong>${wardName} Ward</strong><br/>Communities: ${props.communities || "8-12"}<br/>Click to select Ward`;
    }

    layer.bindTooltip(tooltipContent, {
      sticky: true,
      className: isDark ? "gis-tooltip-dark" : "gis-tooltip-light",
    });

    layer.on({
      mouseover: () => {
        setHoveredFeature(
          currentLevel === "ward" || currentLevel === "lga"
            ? wardName
            : currentLevel === "state"
              ? lgaName
              : stateName,
        );
      },
      mouseout: () => {
        setHoveredFeature(null);
      },
      click: () => {
        if (currentLevel === "national") {
          if (isPilot) onSelectState(stateName);
        } else if (currentLevel === "state") {
          onSelectLga(lgaName);
        } else {
          if (onSelectWard) onSelectWard(wardName);
        }
      },
    });
  };

  const getHudMetrics = () => {
    if (selectedWard) {
      return {
        title: `${selectedWard} Ward`,
        hh: "520",
        ind: "1,840",
        children: "740",
        comm: "8",
      };
    }
    if (selectedLga) {
      return {
        title: `${selectedLga} LGA`,
        hh: "1,280",
        ind: "4,420",
        children: "1,830",
        comm: "28",
      };
    }
    if (selectedState) {
      const stateMap: Record<
        string,
        { hh: string; ind: string; children: string; comm: string }
      > = {
        Abia: { hh: "9,842", ind: "31,820", children: "13,240", comm: "204" },
        Benue: { hh: "11,430", ind: "39,114", children: "16,270", comm: "238" },
        Oyo: { hh: "10,120", ind: "33,640", children: "13,990", comm: "210" },
        Sokoto: {
          hh: "10,120",
          ind: "34,102",
          children: "14,188",
          comm: "212",
        },
      };
      const m = stateMap[selectedState] || {
        hh: "10,378",
        ind: "34,669",
        children: "14,422",
        comm: "216",
      };
      return {
        title: `${selectedState} State`,
        ...m,
      };
    }
    return {
      title: "National (4 Pilot States)",
      hh: "41,512",
      ind: "138,676",
      children: "57,688",
      comm: "864",
    };
  };

  const hud = getHudMetrics();

  const handleReset = () => {
    if (selectedWard && onSelectWard) {
      onSelectWard(null);
    } else if (selectedLga) {
      onSelectLga(null);
    } else if (selectedState) {
      onSelectState(null);
    }
  };

  return (
    <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-slate-200 dark:border-emerald-900/40 bg-slate-50 dark:bg-[#071311] shadow-sm">
      {/* Top Header & Breadcrumb Bar */}
      <div className="absolute top-0 left-0 right-0 z-[400] px-4 py-2.5 bg-white/90 dark:bg-[#091a18]/90 backdrop-blur-md border-b border-slate-200 dark:border-emerald-900/30 flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-xs text-slate-600 dark:text-emerald-400 font-semibold">
          <button
            onClick={() => {
              onSelectState(null);
              onSelectLga(null);
              if (onSelectWard) onSelectWard(null);
            }}
            className="hover:text-emerald-600 dark:hover:text-white transition-colors"
          >
            National
          </button>
          {selectedState && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <button
                onClick={() => {
                  onSelectLga(null);
                  if (onSelectWard) onSelectWard(null);
                }}
                className="hover:text-emerald-600 dark:hover:text-white transition-colors"
              >
                {selectedState}
              </button>
            </>
          )}
          {selectedLga && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <button
                onClick={() => {
                  if (onSelectWard) onSelectWard(null);
                }}
                className="hover:text-emerald-600 dark:hover:text-white transition-colors"
              >
                {selectedLga}
              </button>
            </>
          )}
          {selectedWard && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-emerald-600 dark:text-emerald-300 font-bold">
                {selectedWard}
              </span>
            </>
          )}
        </div>

        <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
          {selectedWard
            ? "WARD LEVEL"
            : selectedLga
              ? "LGA DRILLDOWN"
              : selectedState
                ? "STATE LEVEL"
                : "NATIONAL LEVEL"}
        </span>
      </div>

      {/* Floating HUD Card */}
      <div className="absolute top-12 left-3 z-[400] w-64 p-3 rounded-lg bg-white/95 dark:bg-[#071715]/95 backdrop-blur-md border border-slate-200 dark:border-emerald-900/40 shadow-lg text-slate-800 dark:text-slate-100 pointer-events-auto">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-900/30 pb-1.5 mb-2">
          <div className="flex items-center space-x-1.5 min-w-0">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {hud.title}
            </h4>
          </div>
          {selectedState && (
            <button
              onClick={handleReset}
              title="Step back"
              className="p-1 rounded text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-emerald-950/60"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
              Households
            </span>
            <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
              {hud.hh}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
              Individuals
            </span>
            <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
              {hud.ind}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
              Children (0-17)
            </span>
            <span className="text-xs font-black text-amber-600 dark:text-amber-400">
              {hud.children}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
              Communities
            </span>
            <span className="text-xs font-black text-cyan-600 dark:text-cyan-400">
              {hud.comm}
            </span>
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-12 right-3 z-[400] flex flex-col space-y-1.5">
        <button
          onClick={() => mapInstanceRef.current?.zoomIn()}
          aria-label="Zoom in"
          className="p-1.5 rounded-lg bg-white/95 dark:bg-[#071715]/95 backdrop-blur-md border border-slate-200 dark:border-emerald-900/40 text-slate-700 dark:text-slate-200 hover:text-emerald-500 shadow-sm"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          aria-label="Zoom out"
          className="p-1.5 rounded-lg bg-white/95 dark:bg-[#071715]/95 backdrop-blur-md border border-slate-200 dark:border-emerald-900/40 text-slate-700 dark:text-slate-200 hover:text-emerald-500 shadow-sm"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        {selectedState && (
          <button
            onClick={() => {
              onSelectState(null);
              onSelectLga(null);
              if (onSelectWard) onSelectWard(null);
            }}
            aria-label="Reset to national"
            title="Reset to National"
            className="p-1.5 rounded-lg bg-white/95 dark:bg-[#071715]/95 backdrop-blur-md border border-slate-200 dark:border-emerald-900/40 text-slate-700 dark:text-slate-200 hover:text-emerald-500 shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Leaflet Pure Vector GIS Canvas */}
      <MapContainer
        center={[9.082, 8.6753]}
        zoom={6}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
        ref={mapInstanceRef}
        style={{ background: isDark ? "#050f0e" : "#f8fafc" }}
      >
        <MapController bounds={mapBounds} />
        {geoData && (
          <GeoJSON
            key={`geojson-${currentLevel}-${selectedState || "nat"}-${selectedLga || "lga"}-${selectedWard || "w"}`}
            data={geoData}
            style={getFeatureStyle}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>

      {/* Slim Dynamic Legend */}
      <div className="absolute bottom-3 right-3 z-[400] px-3 py-1.5 rounded-lg bg-white/95 dark:bg-[#071715]/95 backdrop-blur-md border border-slate-200 dark:border-emerald-900/40 shadow-sm flex items-center space-x-3 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
        {currentLevel === "national" ? (
          <>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Targeted Pilot States</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-emerald-950 border border-slate-400"></span>
              <span>Non-Pilot States</span>
            </div>
          </>
        ) : currentLevel === "state" ? (
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Targeted Pilot LGAs</span>
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
              <span>Targeted Wards</span>
            </div>
            {selectedWard && (
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Selected Ward</span>
              </div>
            )}
          </>
        )}
      </div>

      {loading && (
        <div className="absolute inset-0 z-[500] bg-black/40 backdrop-blur-xs flex items-center justify-center">
          <div className="px-3 py-1.5 rounded bg-white dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 font-bold text-xs shadow-md">
            Rendering Boundaries...
          </div>
        </div>
      )}
    </div>
  );
};
