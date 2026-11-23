import React, { useMemo } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { GeoRecord, DrilldownPath } from "../lib/types";

export interface DrilldownMapProps {
  record?: GeoRecord;
  drilldown?: DrilldownPath;
  path?: DrilldownPath;
  statesSummary?: GeoRecord[];
  allCommunities?: GeoRecord[];
  states?: GeoRecord[];
  communities?: GeoRecord[];
  height?: string;
  onSelectLocation?: (name: string, level: any) => void;
  onDrilldownChange?: (path: DrilldownPath) => void;
  isDark?: boolean;
}

const PILOT_COORDS: Record<string, [number, number]> = {
  ABIA: [5.4527, 7.5248],
  BENUE: [7.7322, 8.5214],
  OYO: [8.1574, 3.6147],
  SOKOTO: [13.0609, 5.239],
};

export const DrilldownMap: React.FC<DrilldownMapProps> = ({
  record,
  drilldown,
  path,
  height,
  onSelectLocation,
  onDrilldownChange,
  isDark = false,
}) => {
  const activeDrilldown: DrilldownPath = drilldown ||
    path || { level: record?.level || "national" };
  const currentLevel = activeDrilldown.level || record?.level || "national";
  const selectedStateName = (activeDrilldown.state || "").toUpperCase();

  const mapCenter: [number, number] = useMemo(() => {
    if (selectedStateName && PILOT_COORDS[selectedStateName]) {
      return PILOT_COORDS[selectedStateName];
    }
    return [9.082, 8.6753];
  }, [selectedStateName]);

  const mapZoom = selectedStateName ? 8 : 6;

  const handleStateClick = (stateName: string) => {
    if (onSelectLocation) onSelectLocation(stateName, "state");
    if (onDrilldownChange) {
      onDrilldownChange({
        level: "state",
        state: stateName,
        lga: null,
        ward: null,
        community: null,
      });
    }
  };

  const legendTitle = useMemo(() => {
    if (currentLevel === "national") return "Targeted States";
    if (currentLevel === "state") return "Targeted LGAs";
    if (currentLevel === "lga") return "Targeted Wards";
    return "Targeted Communities";
  }, [currentLevel]);

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col"
      style={{ height: height || "100%", minHeight: "500px" }}
    >
      <div className="absolute top-3 left-3 z-[1000] px-3.5 py-2 rounded-lg backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <span className="text-[10px] font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase block">
          Spatial Matrix &bull; {currentLevel.toUpperCase()} LEVEL
        </span>
        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
          {record?.name || "National Overview"}
        </span>
      </div>

      <div className="flex-1 w-full h-full relative">
        <MapContainer
          key={`map-${selectedStateName}-${isDark ? "d" : "l"}`}
          center={mapCenter}
          zoom={mapZoom}
          style={{
            height: "100%",
            width: "100%",
            background: isDark ? "#020617" : "#F8FAFC",
          }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &bull; NASSCO'
          />
        </MapContainer>
      </div>

      <div className="absolute top-3 right-3 z-[1000] flex flex-wrap gap-1.5 max-w-[200px] justify-end">
        {["Abia", "Benue", "Oyo", "Sokoto"].map((st) => {
          const isSelected = selectedStateName === st.toUpperCase();
          return (
            <button
              key={st}
              type="button"
              onClick={() => handleStateClick(st)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all shadow-sm ${
                isSelected
                  ? "bg-blue-600 text-white"
                  : "bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700"
              }`}
            >
              {st}
            </button>
          );
        })}
      </div>

      <div className="absolute bottom-3 right-3 z-[1000] px-3 py-2 rounded-lg backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm text-xs space-y-1.5">
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
          {legendTitle}
        </span>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-blue-600 inline-block" />
          <span className="text-[11px] text-slate-700 dark:text-slate-300">
            Selected Focus
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-[#002F6C] inline-block" />
          <span className="text-[11px] text-slate-700 dark:text-slate-300">
            Pilot States
          </span>
        </div>
      </div>
    </div>
  );
};

export default DrilldownMap;
