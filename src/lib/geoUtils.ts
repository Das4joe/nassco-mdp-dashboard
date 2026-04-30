// src/lib/geoUtils.ts
import { topoToGeo } from "./topoConvert";

export type GeoJSONFeature = {
  type: "Feature";
  geometry: { type: string; coordinates: unknown[] };
  properties: Record<string, unknown>;
};

export type GeoJSONCollection = {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
};

export function normalizeGeoJSON(raw: unknown): GeoJSONCollection | null {
  if (!raw || typeof raw !== "object") {
    console.error("GeoJSON: input is not an object");
    return null;
  }

  const obj = raw as Record<string, unknown>;

  // ✅ TopoJSON — convert first
  if (obj.type === "Topology") {
    console.log("Detected TopoJSON — converting...");
    return topoToGeo(raw);
  }

  // ✅ Valid FeatureCollection
  if (obj.type === "FeatureCollection" && Array.isArray(obj.features)) {
    const valid = validateFeatures(obj.features);
    console.log(`FeatureCollection: ${valid.length} valid features`);
    return { type: "FeatureCollection", features: valid };
  }

  // ✅ Single Feature
  if (obj.type === "Feature" && obj.geometry) {
    return {
      type: "FeatureCollection",
      features: [obj as unknown as GeoJSONFeature],
    };
  }

  console.error("Unrecognized format. Keys:", Object.keys(obj));
  return null;
}

function validateFeatures(arr: unknown[]): GeoJSONFeature[] {
  return arr.filter((f): f is GeoJSONFeature => {
    if (!f || typeof f !== "object") return false;
    const o = f as Record<string, unknown>;
    if (o.type !== "Feature") return false;
    const g = o.geometry as Record<string, unknown> | null;
    return !!g && typeof g.type === "string" && Array.isArray(g.coordinates);
  });
}

export function filterByState(
  geo: GeoJSONCollection,
  ns: string,
  getStateFn: (p: Record<string, unknown>) => string,
  normFn: (v: unknown) => string
): GeoJSONCollection {
  return {
    type: "FeatureCollection",
    features: geo.features.filter(
      (f) => normFn(getStateFn(f.properties)) === ns
    ),
  };
}