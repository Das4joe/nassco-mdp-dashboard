import type React from "react";
import { useEffect, useState } from "react";
import { MapContainer, GeoJSON, useMap } from "react-leaflet";
import { RotateCcw } from "lucide-react";
import type { FeatureCollection } from "geojson";
import type { GeoLevel, GeoRecord, DomainId, DrilldownState } from "../types";
import { getGeoJson } from "../services/dataService";
import "leaflet/dist/leaflet.css";

export interface DrilldownMapProps {
  level?: GeoLevel;
  drilldown?: DrilldownState;
  selectedState?: string | null;
  selectedLga?: string | null;
  selectedWard?: string | null;
  onSelectState?: (stateName: string) => void;
  onSelectLga?: (lgaName: string) => void;
  onSelectWard?: (wardName: string) => void;
  onReset?: () => void;
  isDark?: boolean;
  activeDomain?: DomainId | string;
  record?: GeoRecord;
  currentRecord?: GeoRecord;
  activeRecord?: GeoRecord;
  className?: string;
}

const PILOT_STATES = ["Abia", "Benue", "Oyo", "Sokoto"];

const MapAutoBounds: React.FC<{
  level: GeoLevel;
  selectedState: string | null;
}> = ({ level, selectedState }) => {
  const map = useMap();

  useEffect(() => {
    try {
      map.invalidateSize();
      if (level === "national" || !selectedState) {
        map.setView([9.082, 8.6753], 6);
      } else if (level === "state" && selectedState) {
        const s = selectedState.toLowerCase();
        if (s.includes("sokoto")) map.setView([13.06, 5.24], 8);
        else if (s.includes("benue")) map.setView([7.45, 8.74], 8);
        else if (s.includes("oyo")) map.setView([8.15, 3.61], 8);
        else if (s.includes("abia")) map.setView([5.45, 7.52], 9);
      }
    } catch {
      // Safe boundary ignore
    }
  }, [level, selectedState, map]);

  return null;
};

export const DrilldownMap: React.FC<DrilldownMapProps> = ({
  level: propLevel,
  drilldown,
  selectedState: propState,
  selectedLga: propLga,
  onSelectState,
  onSelectLga,
  onReset,
  isDark = true,
  record,
  currentRecord,
  activeRecord,
  className = "",
}) => {
  const level = drilldown?.level || propLevel || "national";
  const selectedState = drilldown?.state || propState || null;
  const selectedLga = drilldown?.lga || propLga || null;
  const activeData = record || currentRecord || activeRecord;

  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getGeoJson(level).then((data) => {
      if (!isMounted) return;
      if (data && data.features) {
        if (level === "state" && selectedState) {
          const filtered = data.features.filter((f: any) => {
            const stateProp =
              f.properties?.state_name ||
              f.properties?.statename ||
              f.properties?.STATE ||
              f.properties?.admin1Name ||
              f.properties?.state ||
              "";
            return stateProp
              .toLowerCase()
              .includes(selectedState.toLowerCase());
          });
          setGeoData({
            type: "FeatureCollection",
            features: filtered.length > 0 ? filtered : data.features,
          });
        } else {
          setGeoData(data);
        }
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [level, selectedState]);

  const styleFeature = (feature: any) => {
    const name =
      feature.properties?.state_name ||
      feature.properties?.statename ||
      feature.properties?.NAME_1 ||
      feature.properties?.admin1Name ||
      feature.properties?.name ||
      "";
    const isPilot = PILOT_STATES.some((p) =>
      name.toLowerCase().includes(p.toLowerCase()),
    );
    const isSelected =
      selectedLga && name.toLowerCase() === selectedLga.toLowerCase();

    if (level === "national") {
      if (isPilot) {
        return {
          fillColor: isDark ? "#22c55e" : "#10b981",
          weight: 2,
          opacity: 1,
          color: isDark ? "#4ade80" : "#059669",
          fillOpacity: isDark ? 0.85 : 0.9,
        };
      }
      return {
        fillColor: isDark ? "#1b3832" : "#cbd5e1",
        weight: 1,
        opacity: 0.8,
        color: isDark ? "#2d5e54" : "#94a3b8",
        fillOpacity: isDark ? 0.55 : 0.5,
      };
    }

    return {
      fillColor: isSelected ? "#eab308" : isDark ? "#22c55e" : "#10b981",
      weight: 1.5,
      opacity: 1,
      color: isDark ? "#86efac" : "#047857",
      fillOpacity: isSelected ? 0.95 : isDark ? 0.75 : 0.85,
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const name =
      feature.properties?.state_name ||
      feature.properties?.statename ||
      feature.properties?.NAME_1 ||
      feature.properties?.admin1Name ||
      feature.properties?.lga_name ||
      feature.properties?.name ||
      "Administrative Area";

    const isPilot = PILOT_STATES.some((p) =>
      name.toLowerCase().includes(p.toLowerCase()),
    );

    layer.bindTooltip(
      `<strong>${name}</strong>${isPilot ? " (Targeted Pilot)" : ""}`,
      {
        sticky: true,
        className: isDark
          ? "custom-leaflet-tooltip-dark"
          : "custom-leaflet-tooltip-light",
      },
    );

    layer.on({
      click: () => {
        if (level === "national" && onSelectState) {
          if (isPilot) onSelectState(name);
        } else if (level === "state" && onSelectLga) {
          onSelectLga(name);
        }
      },
      mouseover: (e: any) => {
        const l = e.target;
        l.setStyle({
          fillOpacity: 1,
          weight: 2.5,
          color: isDark ? "#ffffff" : "#0f172a",
        });
      },
      mouseout: (e: any) => {
        const l = e.target;
        l.setStyle(styleFeature(feature));
      },
    });
  };

  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-xl border transition-colors ${
        isDark
          ? "bg-[#0b1a18] border-[#134e4a]/60"
          : "bg-[#f1f5f9] border-slate-300 shadow-inner"
      } ${className}`}
    >
      {loading && (
        <div
          className={`absolute inset-0 z-[1000] flex items-center justify-center backdrop-blur-sm text-xs font-semibold ${
            isDark
              ? "bg-[#081514]/70 text-teal-300"
              : "bg-white/70 text-teal-800"
          }`}
        >
          Loading boundary geometries from NSR Registry...
        </div>
      )}

      {/* Floating HUD Card */}
      <div
        className={`absolute top-3 left-3 z-[400] max-w-xs rounded-lg border p-3 text-xs shadow-lg backdrop-blur ${
          isDark
            ? "border-[#134e4a]/80 bg-[#071917]/95 text-slate-100"
            : "border-slate-300 bg-white/95 text-slate-900 shadow-md"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <p
            className={`font-bold truncate text-sm ${isDark ? "text-emerald-400" : "text-emerald-700"}`}
          >
            {activeData?.name ||
              (level === "national"
                ? "Nigeria (4 Pilot States)"
                : selectedState)}
          </p>
          {level !== "national" && onReset && (
            <button
              onClick={onReset}
              className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold transition ${
                isDark
                  ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40"
                  : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300"
              }`}
            >
              <RotateCcw className="h-3 w-3" />
              Reset View
            </button>
          )}
        </div>
        <div
          className={`mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] ${isDark ? "text-slate-300" : "text-slate-600"}`}
        >
          <span>
            HHs:{" "}
            <strong className={isDark ? "text-white" : "text-slate-900"}>
              {(activeData?.households ?? 41512).toLocaleString()}
            </strong>
          </span>
          <span>
            Ind:{" "}
            <strong className={isDark ? "text-white" : "text-slate-900"}>
              {(activeData?.individuals ?? 138676).toLocaleString()}
            </strong>
          </span>
          <span>
            Children:{" "}
            <strong className={isDark ? "text-white" : "text-slate-900"}>
              {(activeData?.children017 ?? 57688).toLocaleString()}
            </strong>
          </span>
          <span>
            NIN:{" "}
            <strong className={isDark ? "text-white" : "text-slate-900"}>
              {activeData?.ninCoverage ?? 29.8}%
            </strong>
          </span>
        </div>
      </div>

      {/* Floating Legend */}
      <div
        className={`absolute bottom-3 right-3 z-[400] rounded-lg border px-3 py-2 text-[10px] font-medium shadow-lg backdrop-blur space-y-1 ${
          isDark
            ? "border-[#134e4a]/80 bg-[#071917]/95 text-slate-200"
            : "border-slate-300 bg-white/95 text-slate-800 shadow-md"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded bg-[#22c55e]" />
          <span>
            {level === "national"
              ? "Targeted Pilot States"
              : "Targeted Pilot LGAs"}
          </span>
        </div>
        {level === "national" && (
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded ${isDark ? "bg-[#1b3832]" : "bg-[#cbd5e1]"}`}
            />
            <span className={isDark ? "text-slate-400" : "text-slate-500"}>
              Non-Pilot States
            </span>
          </div>
        )}
      </div>

      {/* Pure Vector Map */}
      <MapContainer
        center={[9.082, 8.6753]}
        zoom={6}
        attributionControl={false}
        scrollWheelZoom={false}
        className="h-full w-full"
        style={{ background: isDark ? "#081715" : "#e2e8f0" }}
      >
        {geoData && (
          <GeoJSON
            key={`${level}-${selectedState || "all"}-${geoData.features.length}-${isDark}`}
            data={geoData}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        )}
        <MapAutoBounds level={level} selectedState={selectedState} />
      </MapContainer>
    </div>
  );
};

export default DrilldownMap;
