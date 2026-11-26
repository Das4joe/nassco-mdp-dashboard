import type React from "react";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import { RotateCcw } from "lucide-react";
import type { GeoJsonObject } from "geojson";
import type { GeoLevel, GeoRecord, DomainId, DrilldownState } from "../types";
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
  onDrillUp?: () => void;
  isDark?: boolean;
  activeDomain?: DomainId | string;
  record?: GeoRecord;
  currentRecord?: GeoRecord;
  activeRecord?: GeoRecord;
  data?: GeoRecord;
  className?: string;
}

const PILOT_STATES = ["Abia", "Benue", "Oyo", "Sokoto"];

const MapAutoBounds: React.FC<{
  level: GeoLevel;
  selectedState: string | null;
}> = ({ level, selectedState }) => {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    if (level === "national" || !selectedState) {
      map.setView([9.082, 8.6753], 6);
    } else if (level === "state" && selectedState) {
      if (selectedState.toLowerCase().includes("sokoto"))
        map.setView([13.06, 5.24], 8);
      else if (selectedState.toLowerCase().includes("benue"))
        map.setView([7.33, 8.74], 8);
      else if (selectedState.toLowerCase().includes("oyo"))
        map.setView([8.15, 3.61], 8);
      else if (selectedState.toLowerCase().includes("abia"))
        map.setView([5.45, 7.52], 8);
    }
  }, [level, selectedState, map]);

  return null;
};

export const DrilldownMap: React.FC<DrilldownMapProps> = ({
  level: propLevel,
  drilldown,
  selectedState: propState,
  selectedLga: propLga,
  selectedWard: propWard,
  onSelectState,
  onSelectLga,
  onSelectWard,
  onReset,
  record,
  currentRecord,
  activeRecord,
  className = "",
}) => {
  const level = drilldown?.level || propLevel || "national";
  const selectedState = drilldown?.state || propState || null;
  const selectedLga = drilldown?.lga || propLga || null;
  const selectedWard = drilldown?.ward || propWard || null;
  const activeData = record || currentRecord || activeRecord;

  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Active target label for floating HUD
  const activeLabel =
    selectedWard || selectedLga || selectedState || "4 Pilot States";

  useEffect(() => {
    let url = "/geojson/nigeria-states.json";
    if (level === "state" || level === "lga") {
      url = "/geojson/nigeria_lga.json";
    } else if (level === "ward") {
      url = "/geojson/nigeria_ward.json";
    }

    setLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (level === "state" && selectedState) {
          const filteredFeatures = (data.features || []).filter((f: any) => {
            const stateProp =
              f.properties?.state_name ||
              f.properties?.statename ||
              f.properties?.STATE ||
              f.properties?.admin1Name ||
              "";
            return stateProp
              .toLowerCase()
              .includes(selectedState.toLowerCase());
          });
          setGeoData({ ...data, features: filteredFeatures });
        } else {
          setGeoData(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setGeoData(null);
        setLoading(false);
      });
  }, [level, selectedState]);

  const styleFeature = (feature: any) => {
    const name =
      feature.properties?.state_name ||
      feature.properties?.statename ||
      feature.properties?.NAME_1 ||
      feature.properties?.admin1Name ||
      "";
    const isPilot = PILOT_STATES.some((p) =>
      name.toLowerCase().includes(p.toLowerCase()),
    );

    if (level === "national") {
      return {
        fillColor: isPilot ? "#2DD4BF" : "#0F2422",
        weight: isPilot ? 2 : 1,
        opacity: 0.9,
        color: isPilot ? "#5EEAD4" : "#134e4a",
        fillOpacity: isPilot ? 0.75 : 0.45,
      };
    }

    return {
      fillColor: "#2DD4BF",
      weight: 1.5,
      opacity: 0.9,
      color: "#5EEAD4",
      fillOpacity: 0.65,
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const name =
      feature.properties?.state_name ||
      feature.properties?.statename ||
      feature.properties?.NAME_1 ||
      feature.properties?.admin1Name ||
      feature.properties?.lga_name ||
      feature.properties?.ward_name ||
      "Administrative Area";

    layer.bindTooltip(name, {
      sticky: true,
      className: "custom-leaflet-tooltip",
    });

    layer.on({
      click: () => {
        if (level === "national" && onSelectState) {
          const isPilot = PILOT_STATES.some((p) =>
            name.toLowerCase().includes(p.toLowerCase()),
          );
          if (isPilot) onSelectState(name);
        } else if (level === "state" && onSelectLga) {
          onSelectLga(name);
        } else if (level === "lga" && onSelectWard) {
          onSelectWard(name);
        }
      },
      mouseover: (e: any) => {
        const l = e.target;
        l.setStyle({ fillOpacity: 0.9, weight: 2.5 });
      },
      mouseout: (e: any) => {
        const l = e.target;
        l.setStyle(styleFeature(feature));
      },
    });
  };

  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-lg ${className}`}
    >
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-[#081514]/70 backdrop-blur-sm text-teal-300 text-xs">
          Loading boundary geometries...
        </div>
      )}

      {/* Floating HUD Card */}
      <div className="absolute top-3 left-3 z-[400] max-w-xs rounded-lg border border-[#134e4a]/60 bg-[#071c1a]/90 p-2.5 text-xs shadow-lg backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-teal-300 truncate">
            {activeData?.name || activeLabel}
          </p>
          {level !== "national" && onReset && (
            <button
              onClick={onReset}
              title="Reset to National View"
              className="flex items-center gap-1 rounded bg-teal-500/20 px-1.5 py-0.5 text-[10px] text-teal-300 hover:bg-teal-500/30"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>
        <div className="mt-1 grid grid-cols-2 gap-x-2 text-[11px] text-slate-300">
          <span>
            HHs:{" "}
            <strong className="text-white">
              {(activeData?.households ?? 41512).toLocaleString()}
            </strong>
          </span>
          <span>
            Ind:{" "}
            <strong className="text-white">
              {(activeData?.individuals ?? 138676).toLocaleString()}
            </strong>
          </span>
          <span>
            Children:{" "}
            <strong className="text-white">
              {(activeData?.children017 ?? 57688).toLocaleString()}
            </strong>
          </span>
          <span>
            NIN:{" "}
            <strong className="text-white">
              {activeData?.ninCoverage ?? 29.8}%
            </strong>
          </span>
        </div>
      </div>

      {/* Slim Legend */}
      <div className="absolute bottom-3 right-3 z-[400] rounded-lg border border-[#134e4a]/60 bg-[#071c1a]/90 px-3 py-2 text-[10px] shadow-lg backdrop-blur space-y-1">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded bg-[#2DD4BF]" />
          <span className="text-slate-200">
            {level === "national"
              ? "Targeted States"
              : level === "state"
                ? "Targeted LGAs"
                : "Targeted Communities"}
          </span>
        </div>
        {level === "national" && (
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded bg-[#0F2422] border border-[#134e4a]" />
            <span className="text-slate-400">Non-Pilot States</span>
          </div>
        )}
      </div>

      <MapContainer
        center={[9.082, 8.6753]}
        zoom={6}
        scrollWheelZoom={false}
        className="h-full w-full bg-[#061211]"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          opacity={0.3}
        />
        {geoData && (
          <GeoJSON
            key={`${level}-${selectedState || "all"}`}
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
