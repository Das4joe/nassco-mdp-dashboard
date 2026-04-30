// src/maps/NigeriaStateMap.tsx
// ═══════════════════════════════════════════════════════════════
// NASSCO MDP — Map 1: Nigeria State-Level Coverage
// FIXES:
//   1. Duplicate labels removed — largest polygon only
//   2. Bold dark borders matching reference image
//   3. Chip font always readable on any background
// ═══════════════════════════════════════════════════════════════
import { useMemo } from "react";
import { MapContainer, GeoJSON } from "react-leaflet";
import type { Layer, PathOptions } from "leaflet";
import type { StateAgg } from "../lib/aggregations";
import { normalize } from "../lib/normalize";
import { STATE_COLORS } from "../theme";
import type { GeoJSONCollection } from "../lib/geoUtils";

export function getStateName(properties: Record<string, unknown>): string {
  return String(
    properties?.NAME_1 ??
      properties?.name_1 ??
      properties?.admin1Name ??
      properties?.shapeName ??
      properties?.statename ??
      properties?.state ??
      properties?.name ??
      properties?.NAME ??
      "",
  );
}

function polygonArea(coords: number[][]): number {
  let area = 0;
  for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
    area += (coords[j][0] + coords[i][0]) * (coords[j][1] - coords[i][1]);
  }
  return Math.abs(area / 2);
}

function featureArea(feature: any): number {
  const g = feature?.geometry;
  if (!g) return 0;
  if (g.type === "Polygon") return polygonArea(g.coordinates[0] ?? []);
  if (g.type === "MultiPolygon")
    return Math.max(
      ...g.coordinates.map((p: number[][][]) => polygonArea(p[0] ?? [])),
    );
  return 0;
}

interface Props {
  statesAgg: StateAgg[];
  geojson: GeoJSONCollection | null;
  communityCounts: Record<string, number>;
  onStateClick?: (stateName: string) => void;
}

export default function NigeriaStateMap({
  statesAgg,
  geojson,
  communityCounts,
  onStateClick,
}: Props) {
  const stateMap = useMemo(
    () => new Map(statesAgg.map((s) => [s.normalizedState, s])),
    [statesAgg],
  );

  const largestFeaturePerState = useMemo(() => {
    if (!geojson) return new Map<string, number>();
    const best = new Map<string, { idx: number; area: number }>();
    geojson.features.forEach((f, idx) => {
      const ns = normalize(
        getStateName(f.properties as Record<string, unknown>),
      );
      if (!stateMap.has(ns)) return;
      const area = featureArea(f);
      const prev = best.get(ns);
      if (!prev || area > prev.area) best.set(ns, { idx, area });
    });
    const result = new Map<string, number>();
    best.forEach((v, k) => result.set(k, v.idx));
    return result;
  }, [geojson, stateMap]);

  function getStyle(feature?: {
    properties: Record<string, unknown>;
  }): PathOptions {
    const rawName = getStateName(feature?.properties ?? {});
    const ns = normalize(rawName);
    const data = stateMap.get(ns);
    return {
      fillColor: data ? (STATE_COLORS[data.state] ?? "#4CAF50") : "#C8D6C0",
      fillOpacity: data ? 0.85 : 0.3,
      color: "#1a1a1a", // ← always dark border like reference
      weight: data ? 2.5 : 1.2,
    };
  }

  function onEachFeatureWithIndex(feature: any, layer: Layer) {
    const rawName = getStateName(feature.properties);
    const ns = normalize(rawName);
    const data = stateMap.get(ns);
    const color = data ? (STATE_COLORS[data.state] ?? "#4CAF50") : "#94A3B8";
    const idx = geojson?.features.indexOf(feature) ?? -1;
    const isLargest = largestFeaturePerState.get(ns) === idx;
    const communities = data
      ? (communityCounts[data.state] ?? 0).toLocaleString()
      : "0";

    if (data && isLargest) {
      (layer as any).bindTooltip(
        `<div class="nassco-state-chip" style="border-color:${color};">
           <span class="chip-name" style="color:${color};">${data.state}</span>
           <span class="chip-row">
             🏠 <strong>${data.hh.toLocaleString()}</strong> HHs
           </span>
           <span class="chip-row">
             📍 ${data.lgaCount} LGAs &nbsp;·&nbsp; ${communities} Communities
           </span>
         </div>`,
        {
          permanent: true,
          direction: "center",
          className: "nassco-chip-wrapper",
          opacity: 1,
        },
      );
    } else {
      (layer as any).bindTooltip(rawName || "—", {
        permanent: false,
        direction: "auto",
        className: "nassco-hover-tip",
      });
    }

    layer.on({
      click: () => {
        if (data && onStateClick) onStateClick(rawName);
      },
      mouseover: (e: any) => {
        if (data) {
          e.target.setStyle({ fillOpacity: 0.97, weight: 3.5 });
          e.target.bringToFront();
        }
      },
      mouseout: (e: any) => {
        e.target.setStyle(getStyle(feature));
      },
    });
  }

  if (!geojson || geojson.features.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          aspectRatio: "4 / 3",
          minHeight: 380,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#F8FAFC",
          borderRadius: 12,
          color: "#94A3B8",
          gap: 12,
          fontSize: 13,
        }}
      >
        <span style={{ fontSize: 38 }}>🗺️</span>
        <span>
          {!geojson ? "Loading state boundaries…" : "No state features found."}
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "4 / 3",
        minHeight: 380,
        borderRadius: 12,
        overflow: "hidden",
        background: "#F1F5F9",
      }}
    >
      <MapContainer
        center={[9.08, 8.67]}
        zoom={6}
        style={{ height: "100%", width: "100%", minHeight: 380 }}
        scrollWheelZoom={false}
        zoomControl={true}
        attributionControl={false}
      >
        <GeoJSON
          key={`state-level-${geojson.features.length}`}
          data={geojson as any}
          style={getStyle as any}
          onEachFeature={onEachFeatureWithIndex as any}
        />
      </MapContainer>
    </div>
  );
}
