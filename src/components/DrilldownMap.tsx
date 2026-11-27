import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fetchGeoJson, type GeoLevel } from "../services/dataService";
import type { FeatureCollection } from "geojson";

export interface DrilldownMapProps {
  level?: GeoLevel;
  selectedState?: string | null;
  selectedLga?: string | null;
  onSelectState?: (state: string) => void;
  onSelectLga?: (lga: string) => void;
}

export const DrilldownMap: React.FC<DrilldownMapProps> = ({
  level = "national",
  selectedState,
  onSelectState,
  onSelectLga,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [9.082, 8.6753],
      zoom: 6,
      zoomControl: false,
      attributionControl: false,
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    fetchGeoJson(level, selectedState || undefined).then(
      (data: FeatureCollection) => {
        if (geoJsonLayerRef.current) {
          map.removeLayer(geoJsonLayerRef.current);
        }

        const layer = L.geoJSON(data, {
          style: {
            fillColor: "#10b981",
            fillOpacity: 0.6,
            color: "#059669",
            weight: 1.5,
          },
          onEachFeature: (feature, l) => {
            const props = feature.properties || {};
            const name =
              props.admin1Name ||
              props.state_name ||
              props.NAME_1 ||
              props.admin2Name ||
              props.lga_name ||
              "";
            l.on("click", () => {
              if (level === "national" && onSelectState) onSelectState(name);
              if (level === "state" && onSelectLga) onSelectLga(name);
            });
          },
        }).addTo(map);

        geoJsonLayerRef.current = layer;

        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [20, 20] });
        }
      },
    );
  }, [level, selectedState, onSelectState, onSelectLga]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full min-h-[350px] rounded-xl overflow-hidden"
    />
  );
};

export default DrilldownMap;
