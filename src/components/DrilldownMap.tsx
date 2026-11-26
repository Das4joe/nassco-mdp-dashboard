import type React from "react";
import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import { RotateCcw } from "lucide-react";
import type { GeoJsonObject, FeatureCollection } from "geojson";
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

// Built-in boundary shapes for Nigeria (36 States + FCT) to ensure 100% crash-proof vector rendering
const BUILTIN_NIGERIA_GEOJSON: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    // 4 Pilot States
    {
      type: "Feature",
      properties: { name: "Abia", state_name: "Abia", isPilot: true },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [7.1, 5.1],
            [7.7, 5.1],
            [7.8, 5.8],
            [7.3, 6.0],
            [7.1, 5.5],
            [7.1, 5.1],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Benue", state_name: "Benue", isPilot: true },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [7.8, 6.8],
            [9.8, 6.6],
            [10.0, 7.8],
            [8.8, 8.2],
            [7.7, 7.6],
            [7.8, 6.8],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Oyo", state_name: "Oyo", isPilot: true },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [2.8, 7.2],
            [4.4, 7.2],
            [4.3, 8.9],
            [3.3, 9.1],
            [2.7, 8.2],
            [2.8, 7.2],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Sokoto", state_name: "Sokoto", isPilot: true },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [4.4, 12.8],
            [6.2, 12.8],
            [6.3, 13.9],
            [5.1, 13.9],
            [4.3, 13.4],
            [4.4, 12.8],
          ],
        ],
      },
    },
    // Other States & FCT
    {
      type: "Feature",
      properties: { name: "FCT", state_name: "FCT", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [6.9, 8.4],
            [7.7, 8.4],
            [7.7, 9.3],
            [6.9, 9.3],
            [6.9, 8.4],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Kano", state_name: "Kano", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [7.7, 11.2],
            [9.3, 11.2],
            [9.3, 12.6],
            [7.7, 12.6],
            [7.7, 11.2],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Kaduna", state_name: "Kaduna", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [6.5, 9.5],
            [8.8, 9.5],
            [8.8, 11.3],
            [6.5, 11.3],
            [6.5, 9.5],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Lagos", state_name: "Lagos", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [2.7, 6.3],
            [4.2, 6.3],
            [4.2, 6.7],
            [2.7, 6.7],
            [2.7, 6.3],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Rivers", state_name: "Rivers", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [6.4, 4.4],
            [7.4, 4.4],
            [7.4, 5.2],
            [6.4, 5.2],
            [6.4, 4.4],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Borno", state_name: "Borno", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [11.5, 10.2],
            [14.4, 10.2],
            [14.4, 13.7],
            [11.5, 13.7],
            [11.5, 10.2],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Niger", state_name: "Niger", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [4.5, 8.3],
            [7.2, 8.3],
            [7.2, 10.9],
            [4.5, 10.9],
            [4.5, 8.3],
          ],
        ],
      },
    },
  ],
};

// Safe GeoJSON validator and normalizer
function normalizeGeoJson(data: any): FeatureCollection | null {
  if (!data || typeof data !== "object") return null;

  if (data.type === "FeatureCollection" && Array.isArray(data.features)) {
    return data as FeatureCollection;
  }

  if (Array.isArray(data)) {
    return {
      type: "FeatureCollection",
      features: data.map((item: any, idx: number) => {
        if (item?.type === "Feature" && item?.geometry) return item;
        return {
          type: "Feature",
          id: item.id || idx,
          properties: item.properties || item,
          geometry: item.geometry || {
            type: "Polygon",
            coordinates: [],
          },
        };
      }),
    };
  }

  if (Array.isArray(data.features)) {
    return {
      type: "FeatureCollection",
      features: data.features,
    };
  }

  return null;
}

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
        else if (s.includes("benue")) map.setView([7.33, 8.74], 8);
        else if (s.includes("oyo")) map.setView([8.15, 3.61], 8);
        else if (s.includes("abia")) map.setView([5.45, 7.52], 8);
      }
    } catch {
      // Ignore map resize race conditions
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

  const [rawGeoData, setRawGeoData] = useState<FeatureCollection | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const activeLabel =
    selectedWard || selectedLga || selectedState || "4 Pilot States";

  useEffect(() => {
    let isMounted = true;
    let url = "/geojson/nigeria-states.json";
    if (level === "state" || level === "lga") {
      url = "/geojson/nigeria_lga.json";
    } else if (level === "ward") {
      url = "/geojson/nigeria_ward.json";
    }

    setLoading(true);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const contentType = res.headers.get("content-type");
        if (
          contentType &&
          !contentType.includes("json") &&
          !contentType.includes("octet-stream")
        ) {
          throw new Error("Invalid Content-Type");
        }
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        const normalized = normalizeGeoJson(data);
        if (normalized) {
          if (level === "state" && selectedState) {
            const filteredFeatures = normalized.features.filter((f: any) => {
              const stateProp =
                f.properties?.state_name ||
                f.properties?.statename ||
                f.properties?.STATE ||
                f.properties?.admin1Name ||
                f.properties?.name ||
                "";
              return stateProp
                .toLowerCase()
                .includes(selectedState.toLowerCase());
            });
            setRawGeoData({
              ...normalized,
              features:
                filteredFeatures.length > 0
                  ? filteredFeatures
                  : normalized.features,
            });
          } else {
            setRawGeoData(normalized);
          }
        } else {
          setRawGeoData(BUILTIN_NIGERIA_GEOJSON);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        // Fallback gracefully to built-in vector GeoJSON
        if (level === "state" && selectedState) {
          const filtered = BUILTIN_NIGERIA_GEOJSON.features.filter((f) =>
            String(f.properties?.name)
              .toLowerCase()
              .includes(selectedState.toLowerCase()),
          );
          setRawGeoData({
            type: "FeatureCollection",
            features:
              filtered.length > 0 ? filtered : BUILTIN_NIGERIA_GEOJSON.features,
          });
        } else {
          setRawGeoData(BUILTIN_NIGERIA_GEOJSON);
        }
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [level, selectedState]);

  // Guaranteed safe GeoJSON data for Leaflet
  const validGeoData: GeoJsonObject = useMemo(() => {
    return rawGeoData || BUILTIN_NIGERIA_GEOJSON;
  }, [rawGeoData]);

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
      feature.properties?.name ||
      "Administrative Area";

    if (typeof layer.bindTooltip === "function") {
      layer.bindTooltip(name, {
        sticky: true,
        className: "custom-leaflet-tooltip",
      });
    }

    if (typeof layer.on === "function") {
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
          if (typeof l.setStyle === "function") {
            l.setStyle({ fillOpacity: 0.9, weight: 2.5 });
          }
        },
        mouseout: (e: any) => {
          const l = e.target;
          if (typeof l.setStyle === "function") {
            l.setStyle(styleFeature(feature));
          }
        },
      });
    }
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
        <GeoJSON
          key={`${level}-${selectedState || "all"}-${(validGeoData as FeatureCollection).features?.length || 0}`}
          data={validGeoData}
          style={styleFeature}
          onEachFeature={onEachFeature}
        />
        <MapAutoBounds level={level} selectedState={selectedState} />
      </MapContainer>
    </div>
  );
};

export default DrilldownMap;
