// src/lib/buildStatesFromLgas.ts
// ═══════════════════════════════════════════════════════════════
// Builds a states-level GeoJSON by dissolving LGA features
// grouped by NAME_1. This means we NEVER need nigeria-states.json
// ═══════════════════════════════════════════════════════════════

import type { GeoJSONCollection, GeoJSONFeature } from "./geoUtils";

/**
 * Groups LGA features by state (NAME_1) and returns one
 * representative feature per state — good enough to render
 * the state outlines and handle click events.
 *
 * For a proper dissolve you would need turf.js union().
 * Here we collect ALL LGA features per state into a
 * GeometryCollection so every LGA polygon is included.
 */
export function buildStatesGeoFromLgas(
  lgasGeo: GeoJSONCollection
): GeoJSONCollection {
  // Group features by NAME_1 (state name)
  const groups = new Map<string, GeoJSONFeature[]>();

  for (const f of lgasGeo.features) {
    const stateName = String(
      f.properties?.NAME_1 ??
      f.properties?.state  ??
      f.properties?.name   ??
      "Unknown"
    );
    if (!groups.has(stateName)) groups.set(stateName, []);
    groups.get(stateName)!.push(f);
  }

  // Build one MultiPolygon feature per state
  const stateFeatures: GeoJSONFeature[] = [];

  for (const [stateName, features] of groups) {
    // Collect all polygons for this state
    const allPolygons: unknown[] = [];

    for (const f of features) {
      const geom = f.geometry;
      if (geom.type === "Polygon") {
        allPolygons.push((geom as any).coordinates);
      } else if (geom.type === "MultiPolygon") {
        for (const poly of (geom as any).coordinates) {
          allPolygons.push(poly);
        }
      }
    }

    if (allPolygons.length === 0) continue;

    stateFeatures.push({
      type: "Feature",
      geometry: {
        type: "MultiPolygon",
        coordinates: allPolygons,
      } as any,
      properties: {
        NAME_1:    stateName,
        state:     stateName,
        name:      stateName,
        lgaCount:  features.length,
      },
    });
  }

  console.log(
    `buildStatesGeoFromLgas: built ${stateFeatures.length} state features ` +
    `from ${lgasGeo.features.length} LGA features`
  );

  // Log state names found
  console.log(
    "State names found:",
    stateFeatures.map((f) => f.properties.NAME_1)
  );

  return { type: "FeatureCollection", features: stateFeatures };
}