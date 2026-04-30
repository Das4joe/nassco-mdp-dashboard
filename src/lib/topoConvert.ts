// src/lib/topoConvert.ts
// ═══════════════════════════════════════════════════════════════
// NASSCO MDP — TopoJSON → GeoJSON Converter
// Confirmed: nigeria-states.json
//   object key : NGA_adm1
//   geometries : 38
//   state name : NAME_1  (e.g. "Abia", "Adamawa" …)
// ═══════════════════════════════════════════════════════════════
import type { GeoJSONCollection, GeoJSONFeature } from "./geoUtils";

// ── Internal types ─────────────────────────────────────────────
type Coord    = [number, number];
type Ring     = number[];          // arc indices
type PolyArcs = Ring[];            // one polygon = array of rings
type MultiArcs= PolyArcs[];        // multipolygon = array of polygons

interface Transform {
  scale:     [number, number];
  translate: [number, number];
}

interface TopoGeom {
  type:        string;
  arcs?:       PolyArcs | MultiArcs;
  coordinates?: number[];
  properties?: Record<string, unknown>;
  geometries?: TopoGeom[];
}

interface TopoObject {
  type:       string;
  geometries: TopoGeom[];
}

interface Topology {
  type:       "Topology";
  arcs:       Coord[][];
  transform?: Transform;
  objects:    Record<string, TopoObject>;
}

// ── Step 1: delta-decode all arcs ──────────────────────────────
function decodeArcs(
  rawArcs:   Coord[][],
  transform?: Transform
): Coord[][] {
  const sx = transform?.scale[0]     ?? 1;
  const sy = transform?.scale[1]     ?? 1;
  const tx = transform?.translate[0] ?? 0;
  const ty = transform?.translate[1] ?? 0;

  return rawArcs.map((arc) => {
    let x = 0;
    let y = 0;
    return arc.map(([dx, dy]): Coord => {
      x += dx;
      y += dy;
      return [x * sx + tx, y * sy + ty];
    });
  });
}

// ── Step 2: stitch arc indices into one coordinate ring ─────────
function stitchRing(decoded: Coord[][], ring: Ring): Coord[] {
  const pts: Coord[] = [];
  for (const idx of ring) {
    const arc =
      idx >= 0
        ? decoded[idx]
        : [...decoded[~idx]].reverse();
    // First arc: take all points. Subsequent arcs: skip first point
    // (it is the same as the previous arc's last point)
    pts.push(...(pts.length === 0 ? arc : arc.slice(1)));
  }
  return pts;
}

// ── Step 3: convert one TopoJSON geometry → GeoJSON geometry ───
function convertGeom(
  decoded: Coord[][],
  geom:    TopoGeom
): { type: string; coordinates: unknown } | null {
  switch (geom.type) {
    case "Polygon": {
      const arcs = geom.arcs as PolyArcs;
      return {
        type:        "Polygon",
        coordinates: arcs.map((ring) => stitchRing(decoded, ring)),
      };
    }

    case "MultiPolygon": {
      const arcs = geom.arcs as MultiArcs;
      return {
        type:        "MultiPolygon",
        coordinates: arcs.map((poly) =>
          poly.map((ring) => stitchRing(decoded, ring))
        ),
      };
    }

    case "Point":
      return {
        type:        "Point",
        coordinates: geom.coordinates ?? [],
      };

    case "GeometryCollection":
      // Return first successfully converted sub-geometry
      for (const sub of geom.geometries ?? []) {
        const result = convertGeom(decoded, sub);
        if (result) return result;
      }
      return null;

    default:
      console.warn(`topoConvert: skipping unknown type "${geom.type}"`);
      return null;
  }
}

// ── Main export ────────────────────────────────────────────────
export function topoToGeo(raw: unknown): GeoJSONCollection | null {
  if (!raw || typeof raw !== "object") {
    console.error("topoToGeo: input is not an object");
    return null;
  }

  const topo = raw as Topology;

  if (topo.type !== "Topology") {
    console.warn("topoToGeo: not a Topology, got:", topo.type);
    return null;
  }

  const allKeys = Object.keys(topo.objects ?? {});
  if (allKeys.length === 0) {
    console.error("topoToGeo: topology has no objects");
    return null;
  }

  console.log("topoToGeo — all object keys:", allKeys);

  // ✅ Prefer NGA_adm1 (confirmed), then any adm/state key, then first
  const key =
    allKeys.find((k) => k === "NGA_adm1") ??
    allKeys.find((k) => /adm|state/i.test(k)) ??
    allKeys[0];

  console.log(`topoToGeo — using key: "${key}"`);

  const obj = topo.objects[key];
  if (!obj?.geometries?.length) {
    console.error(`topoToGeo: no geometries in "${key}"`);
    return null;
  }

  console.log(`topoToGeo — geometries in "${key}": ${obj.geometries.length}`);

  const decoded  = decodeArcs(topo.arcs, topo.transform);
  const features: GeoJSONFeature[] = [];
  let   skipped  = 0;

  for (const geom of obj.geometries) {
    const geo = convertGeom(decoded, geom);
    if (!geo) {
      skipped++;
      continue;
    }
    features.push({
      type:       "Feature",
      geometry:   geo as GeoJSONFeature["geometry"],
      properties: geom.properties ?? {},
    });
  }

  if (skipped > 0) {
    console.warn(`topoToGeo: skipped ${skipped} geometries`);
  }

  console.log(`topoToGeo — converted ${features.length} features ✅`);

  if (features.length > 0) {
    console.log("topoToGeo — sample properties:", features[0].properties);
  }

  return { type: "FeatureCollection", features };
}