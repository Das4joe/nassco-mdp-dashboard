// src/maps/NigeriaMap.tsx
// ═══════════════════════════════════════════════════════════════
// NASSCO MDP — Map 2: Nigeria LGA-Level Map
// FIXES:
//   1. Duplicate labels removed — only ONE tooltip per state
//      (bound to the LARGEST polygon only)
//   2. Bold dark borders on all features
//   3. No permanent labels on non-intervention states
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

// ── Helper: compute polygon area (shoelace) for picking largest ──
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
  if (g.type === "Polygon") {
    return polygonArea(g.coordinates[0] ?? []);
  }
  if (g.type === "MultiPolygon") {
    return Math.max(
      ...g.coordinates.map((poly: number[][][]) => polygonArea(poly[0] ?? [])),
    );
  }
  return 0;
}

interface Props {
  statesAgg: StateAgg[];
  geojson: GeoJSONCollection | null;
  onStateClick?: (stateName: string) => void;
}

export default function NigeriaMap({
  statesAgg,
  geojson,
  onStateClick,
}: Props) {
  const stateMap = useMemo(
    () => new Map(statesAgg.map((s) => [s.normalizedState, s])),
    [statesAgg],
  );

  // ── Pre-compute: for each intervention state, which feature index
  //    has the largest area? Only THAT feature gets the permanent label.
  const largestFeaturePerState = useMemo(() => {
    if (!geojson) return new Map<string, number>();
    const best = new Map<string, { idx: number; area: number }>();
    geojson.features.forEach((f, idx) => {
      const rawName = getStateName(f.properties as Record<string, unknown>);
      const ns = normalize(rawName);
      if (!stateMap.has(ns)) return;
      const area = featureArea(f);
      const prev = best.get(ns);
      if (!prev || area > prev.area) best.set(ns, { idx, area });
    });
    const result = new Map<string, number>();
    best.forEach((v, k) => result.set(k, v.idx));
    return result;
  }, [geojson, stateMap]);

  // ── Style ────────────────────────────────────────────────────
  function getStyle(feature?: {
    properties: Record<string, unknown>;
  }): PathOptions {
    const rawName = getStateName(feature?.properties ?? {});
    const ns = normalize(rawName);
    const data = stateMap.get(ns);
    return {
      fillColor: data ? (STATE_COLORS[data.state] ?? "#4CAF50") : "#C8D6C0",
      fillOpacity: data ? 0.82 : 0.3,
      color: data ? "#1a1a1a" : "#666666", // ← dark borders
      weight: data ? 2.5 : 1.0, // ← bold borders
    };
  }

  // ── Per-feature events + labels ──────────────────────────────
  function onEachFeature(
    feature: { properties: Record<string, unknown> },
    layer: Layer,
    featureIndex: number,
  ) {
    const rawName = getStateName(feature.properties);
    const ns = normalize(rawName);
    const data = stateMap.get(ns);
    const color = data ? (STATE_COLORS[data.state] ?? "#4CAF50") : "#94A3B8";

    const isLargest = largestFeaturePerState.get(ns) === featureIndex;

    if (data && isLargest) {
      // Permanent chip — only on the single largest polygon for this state
      (layer as any).bindTooltip(
        `<div class="nassco-state-chip" style="border-color:${color};">
           <span class="chip-name" style="color:${color};">${data.state}</span>
           <span class="chip-row">
             🏠 <strong>${data.hh.toLocaleString()}</strong> HHs
             &nbsp;·&nbsp; ${data.lgaCount} LGAs
           </span>
         </div>`,
        {
          permanent: true,
          direction: "center",
          className: "nassco-chip-wrapper",
          opacity: 1,
        },
      );
    } else if (data && !isLargest) {
      // Smaller polygons of same state → hover only
      (layer as any).bindTooltip(rawName, {
        permanent: false,
        direction: "auto",
        className: "nassco-hover-tip",
      });
    } else {
      // Non-intervention state → hover only
      (layer as any).bindTooltip(rawName, {
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
          e.target.setStyle({ fillOpacity: 0.95, weight: 3.5 });
          e.target.bringToFront();
        }
      },
      mouseout: (e: any) => {
        e.target.setStyle(getStyle(feature));
      },
    });
  }

  // ── Wrap onEachFeature to inject index ───────────────────────
  function onEachFeatureWithIndex(feature: any, layer: Layer) {
    const idx = geojson?.features.indexOf(feature) ?? -1;
    onEachFeature(feature, layer, idx);
  }

  if (!geojson || geojson.features.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          aspectRatio: "4 / 3",
          minHeight: 380,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F8FAFC",
          borderRadius: 12,
          color: "#94A3B8",
          fontSize: 13,
          gap: 10,
        }}
      >
        <span style={{ fontSize: 36 }}>🗺️</span>
        <span>Loading LGA map…</span>
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
          key={`nigeria-lga-${geojson.features.length}`}
          data={geojson as any}
          style={getStyle as any}
          onEachFeature={onEachFeatureWithIndex as any}
        />
      </MapContainer>
    </div>
  );
}
