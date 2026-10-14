import type { GeoRecord, DataMetadata } from "./types";

export interface DashboardData {
  national: GeoRecord;
  states: GeoRecord[];
  lgas: GeoRecord[];
  wards: GeoRecord[];
  communities: GeoRecord[];
  metadata?: DataMetadata;
}

const sanitizeRecord = (raw: any): GeoRecord => {
  if (!raw) {
    return {
      nsr: {
        total_households: 0,
        total_individuals: 0,
        total_male: 0,
        total_female: 0,
        children_under18: 0,
        children_under5: 0,
        pwd: 0,
      },
      extended: {},
    };
  }

  const nsr = raw.nsr || {
    total_households: raw.total_households || 0,
    total_individuals: raw.total_individuals || 0,
    total_male: raw.gender_ratio?.boys || 0,
    total_female: raw.gender_ratio?.girls || 0,
    children_under18: raw.children_0_17 || 0,
    children_under5: raw.children_0_5 || 0,
    pwd: raw.plwd || 0,
  };

  const extended = raw.extended || {
    age_sex_pyramid: raw.pyramid_0_24 || [],
    civil_registration: raw.civil_registration,
    education_v2: raw.education,
    health_v2: raw.health_nutrition,
    nutrition_v2: raw.nutrition,
    livelihoods_resilience_v2: raw.livelihoods,
  };

  return {
    ...raw,
    nsr,
    extended,
  };
};

export async function loadAllData(): Promise<DashboardData> {
  const fetchJson = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(
        `Failed to load data from ${url} (Status: ${res.status})`,
      );
    }
    return res.json();
  };

  try {
    const [nationalRaw, statesRaw, lgasRaw, wardsRaw, communitiesRaw] =
      await Promise.all([
        fetchJson("/data/national_summary.json"),
        fetchJson("/data/states_summary.json"),
        fetchJson("/data/lga_summary.json"),
        fetchJson("/data/ward_summary.json"),
        fetchJson("/data/community_summary.json"),
      ]);

    return {
      national: sanitizeRecord(nationalRaw),
      states: Array.isArray(statesRaw) ? statesRaw.map(sanitizeRecord) : [],
      lgas: Array.isArray(lgasRaw) ? lgasRaw.map(sanitizeRecord) : [],
      wards: Array.isArray(wardsRaw) ? wardsRaw.map(sanitizeRecord) : [],
      communities: Array.isArray(communitiesRaw)
        ? communitiesRaw.map(sanitizeRecord)
        : [],
      metadata: {
        last_updated: new Date().toISOString(),
        source: "NASSCO MDP Survey Wave 2026",
        total_records: nationalRaw?.total_individuals || 138676,
        mdp_states: ["ABIA", "BENUE", "OYO", "SOKOTO"],
        total_households: nationalRaw?.total_households || 41512,
      },
    };
  } catch (err) {
    console.error("Error loading dashboard JSON payloads:", err);
    throw err;
  }
}
