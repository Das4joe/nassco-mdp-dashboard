// src/maps/StateLgaMap.tsx
// ═══════════════════════════════════════════════════════════════
// NASSCO MDP — LGA drill-down map for a selected state
// FIXES:
//   1. Label font color adapts to fill darkness (white on dark, dark on light)
//   2. Bold visible borders on all LGAs
//   3. Dynamic legend moved HERE (shows when state is selected)
//   4. Hover tooltips always readable
// ═══════════════════════════════════════════════════════════════
import { useMemo } from "react";
import { MapContainer, GeoJSON } from "react-leaflet";
import type { Layer, PathOptions } from "leaflet";
import type { LgaAgg } from "../lib/aggregations";
import { normalize } from "../lib/normalize";
import { STATE_COLORS } from "../theme";
import type { GeoJSONCollection } from "../lib/geoUtils";

// ── LGA name extractor ────────────────────────────────────────
function getLgaName(props: Record<string, unknown>): string {
  return String(
    props?.NAME_2 ??
      props?.name_2 ??
      props?.LGA ??
      props?.lga ??
      props?.lganame ??
      props?.admin2Name ??
      props?.name ??
      props?.NAME ??
      "",
  );
}

function getStateNameFromProps(props: Record<string, unknown>): string {
  return String(
    props?.NAME_1 ??
      props?.name_1 ??
      props?.admin1Name ??
      props?.statename ??
      props?.state ??
      "",
  );
}

// ── HH → blue shade (choropleth) ─────────────────────────────
function hhToColor(hh: number): string {
  if (hh === 0) return "#EFF6FF"; // very light blue
  if (hh <= 50) return "#BFDBFE";
  if (hh <= 100) return "#93C5FD";
  if (hh <= 200) return "#60A5FA";
  if (hh <= 500) return "#3B82F6";
  if (hh <= 1000) return "#2563EB";
  if (hh <= 2000) return "#1D4ED8";
  return "#1E3A8A"; // 2000+
}

// ── Pick label color for contrast against fill ───────────────
// Returns white for dark fills, near-black for light fills
function labelColor(hh: number): string {
  // dark fills: hh > 200
  return hh > 200 ? "#FFFFFF" : "#1E293B";
}

// ── Dynamic Legend ────────────────────────────────────────────
interface LegendProps {
  stateColor: string;
  stateName: string;
  lgaAgg: LgaAgg[];
}

function DynamicLegend({ stateColor, stateName, lgaAgg }: LegendProps) {
  const maxHh = Math.max(...lgaAgg.map((l) => l.hh), 0);
  const totalHh = lgaAgg.reduce((s, l) => s + l.hh, 0);

  const bands = [
    { label: "0 HHs", color: "#EFF6FF", min: 0, max: 0 },
    { label: "1 – 50 HHs", color: "#BFDBFE", min: 1, max: 50 },
    { label: "51 – 100 HHs", color: "#93C5FD", min: 51, max: 100 },
    { label: "101 – 200 HHs", color: "#60A5FA", min: 101, max: 200 },
    { label: "201 – 500 HHs", color: "#3B82F6", min: 201, max: 500 },
    { label: "501 – 1,000 HHs", color: "#2563EB", min: 501, max: 1000 },
    { label: "1,001 – 2,000", color: "#1D4ED8", min: 1001, max: 2000 },
    { label: "2,000+", color: "#1E3A8A", min: 2001, max: Infinity },
  ].filter((b) => maxHh >= b.min); // only show relevant bands

  return (
    <div
      style={{
        background: "#fff",
        border: `1.5px solid ${stateColor}`,
        borderRadius: 10,
        padding: "12px 16px",
        marginTop: 12,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: stateColor,
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#111827",
          }}
        >
          {stateName} — Enumerated HHs by LGA
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 11,
            color: "#6B7280",
            fontWeight: 500,
          }}
        >
          Total: {totalHh.toLocaleString()} HHs
        </span>
      </div>

      {/* Colour bands */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px 14px",
          alignItems: "center",
        }}
      >
        {bands.map((b) => (
          <div
            key={b.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 16,
                height: 12,
                background: b.color,
                border: "1px solid #CBD5E1",
                borderRadius: 3,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 10,
                color: "#374151",
                whiteSpace: "nowrap",
              }}
            >
              {b.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────
interface Props {
  lgaAgg: LgaAgg[];
  geojson: GeoJSONCollection | null;
  selectedState: string;
}

export default function StateLgaMap({ lgaAgg, geojson, selectedState }: Props) {
  const lgaMap = useMemo(
    () => new Map(lgaAgg.map((l) => [l.normalizedLga, l])),
    [lgaAgg],
  );

  const stateColor = STATE_COLORS[selectedState] ?? "#3B82F6";

  // Filter GeoJSON to only features belonging to the selected state
  const filteredGeo = useMemo<GeoJSONCollection | null>(() => {
    if (!geojson) return null;
    const ns = normalize(selectedState);
    const features = geojson.features.filter((f) => {
      const sn = normalize(
        getStateNameFromProps(f.properties as Record<string, unknown>),
      );
      return sn === ns;
    });
    return { type: "FeatureCollection", features };
  }, [geojson, selectedState]);

  // Compute map bounds from filtered features
  const bounds = useMemo(() => {
    if (!filteredGeo || filteredGeo.features.length === 0) return null;
    let minLat = 90,
      maxLat = -90;
    let minLng = 180,
      maxLng = -180;
    filteredGeo.features.forEach((f) => {
      const g = f.geometry as any;
      const rings =
        g.type === "Polygon"
          ? [g.coordinates[0]]
          : g.type === "MultiPolygon"
            ? g.coordinates.map((p: any) => p[0])
            : [];
      rings.forEach((ring: number[][]) => {
        ring.forEach(([lng, lat]) => {
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
          if (lng < minLng) minLng = lng;
          if (lng > maxLng) maxLng = lng;
        });
      });
    });
    return [
      [minLat - 0.1, minLng - 0.1],
      [maxLat + 0.1, maxLng + 0.1],
    ] as [[number, number], [number, number]];
  }, [filteredGeo]);

  // ── Style ──────────────────────────────────────────────────
  function getStyle(feature?: {
    properties: Record<string, unknown>;
  }): PathOptions {
    const lgaName = getLgaName(feature?.properties ?? {});
    const ns = normalize(lgaName);
    const data = lgaMap.get(ns);
    const hh = data?.hh ?? 0;
    return {
      fillColor: hhToColor(hh),
      fillOpacity: 0.88,
      color: "#334155", // ← dark slate border, always visible
      weight: 2.0,
    };
  }

  // ── Per-feature events ─────────────────────────────────────
  function onEachFeature(
    feature: { properties: Record<string, unknown> },
    layer: Layer,
  ) {
    const lgaName = getLgaName(feature.properties);
    const ns = normalize(lgaName);
    const data = lgaMap.get(ns);
    const hh = data?.hh ?? 0;
    const fgColor = labelColor(hh);

    // Permanent centred label on every LGA
    (layer as any).bindTooltip(
      `<div class="nassco-lga-chip">
         <span class="lga-chip-name" style="color:${fgColor};">${lgaName}</span>
         <span class="lga-chip-hh"  style="color:${fgColor}; opacity:0.85;">
           ${hh.toLocaleString()} HHs
         </span>
       </div>`,
      {
        permanent: true,
        direction: "center",
        className: "nassco-lga-chip-wrapper",
        opacity: 1,
      },
    );

    layer.on({
      click: () => {
        window.dispatchEvent(
          new CustomEvent("lga-selected", { detail: { lga: lgaName } }),
        );
      },
      mouseover: (e: any) => {
        e.target.setStyle({ fillOpacity: 1, weight: 3, color: "#0F172A" });
        e.target.bringToFront();
      },
      mouseout: (e: any) => {
        e.target.setStyle(getStyle(feature));
      },
    });
  }

  if (!filteredGeo || filteredGeo.features.length === 0) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: "#94A3B8",
          fontSize: 13,
        }}
      >
        No LGA boundaries found for <strong>{selectedState}</strong>. Check that
        the GeoJSON NAME_1 values match.
      </div>
    );
  }

  return (
    <>
      {/* ── Map ──────────────────────────────────────────── */}
      <div
        style={{
          width: "100%",
          aspectRatio: "4 / 3",
          minHeight: 400,
          borderRadius: 12,
          overflow: "hidden",
          background: "#EFF6FF",
        }}
      >
        <MapContainer
          key={`lga-map-${selectedState}`}
          bounds={
            bounds ?? [
              [4.27, 2.67],
              [13.89, 14.68],
            ]
          }
          boundsOptions={{ padding: [24, 24] }}
          style={{ height: "100%", width: "100%", minHeight: 400 }}
          scrollWheelZoom={false}
          zoomControl={true}
          attributionControl={false}
        >
          <GeoJSON
            key={`lga-geo-${selectedState}-${filteredGeo.features.length}`}
            data={filteredGeo as any}
            style={getStyle as any}
            onEachFeature={onEachFeature as any}
          />
        </MapContainer>
      </div>

      {/* ── Dynamic Legend (lives HERE, below the map) ─── */}
      <DynamicLegend
        stateColor={stateColor}
        stateName={selectedState}
        lgaAgg={lgaAgg}
      />
    </>
  );
}
