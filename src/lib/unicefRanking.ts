/**
 * UNICEF Community Selection — Normalization & Ranking Engine
 *
 * Encodes the exact scoring rules from the UNICEF
 * NormalisationLookUpTable.csv (4-tier quartile scoring, 0-3).
 *
 * Currently 5 of 36 indicators are computable from SUSI Batch 1:
 * - 4 Education & Child Development indicators
 * - 1 Health & Nutrition indicator (under-5 wasting, from MUAC)
 * The remaining 31 indicators await the community-listing form,
 * vital registration data, IYCF module, and immunization records.
 */

import type { GeoRecord, UnicefIndicators } from "./types";

// --------------------------------------------------------------------------
// Indicator catalogue (mirrors UNICEF's IndicatorCatalogue.csv - all 36)
// --------------------------------------------------------------------------

export type UnicefDomain =
  | "Health & Nutrition"
  | "Education & Child Development"
  | "Living Standards"
  | "Work & Shocks";

export interface IndicatorDef {
  key: string;
  domain: UnicefDomain;
  label: string;
  min: number;
  max: number;
  direction: "positive" | "negative";
  susiKey?: keyof UnicefIndicators;
  status: "available" | "pending";
  pendingReason?: string;
}

export const INDICATOR_CATALOGUE: IndicatorDef[] = [
  // ==================================================================
  // HEALTH & NUTRITION (13 indicators — 1 currently available)
  // ==================================================================
  {
    key: "health_facilities",
    domain: "Health & Nutrition",
    label: "Access to health facilities",
    min: 0,
    max: 3,
    direction: "positive",
    status: "pending",
    pendingReason: "Community-listing data source required",
  },

  {
    key: "maternal_mortality",
    domain: "Health & Nutrition",
    label: "Maternal mortality rate",
    min: 0,
    max: 1047,
    direction: "negative",
    status: "pending",
    pendingReason: "Vital registration data required",
  },

  {
    key: "neonatal_mortality",
    domain: "Health & Nutrition",
    label: "Neonatal mortality rate",
    min: 0,
    max: 34,
    direction: "negative",
    status: "pending",
    pendingReason: "Vital registration data required",
  },

  {
    key: "under5_mortality",
    domain: "Health & Nutrition",
    label: "Under-five mortality rate",
    min: 0,
    max: 105,
    direction: "negative",
    status: "pending",
    pendingReason: "Vital registration data required",
  },

  {
    key: "institutional_deliveries",
    domain: "Health & Nutrition",
    label: "Institutional deliveries",
    min: 0,
    max: 39,
    direction: "positive",
    status: "pending",
    pendingReason: "Health-facility data required",
  },

  {
    key: "post_natal_check",
    domain: "Health & Nutrition",
    label: "Post-natal health check for mother",
    min: 0,
    max: 42,
    direction: "positive",
    status: "pending",
    pendingReason: "Health-facility data required",
  },

  {
    key: "under5_stunting",
    domain: "Health & Nutrition",
    label: "Prevalence of under-5 stunting",
    min: 0,
    max: 33,
    direction: "negative",
    status: "pending",
    pendingReason: "Anthropometric survey (height) required",
  },

  {
    key: "under5_wasting",
    domain: "Health & Nutrition",
    label: "Prevalence of under-5 wasting",
    min: 0,
    max: 40, // Locally calibrated to observed pilot range (Abia 5.6% – Sokoto 36.4%).
    // UNICEF's official national reference ceiling is 11%, but 3 of 4
    // MDP states exceed that — using it would clip all of them to the
    // same worst-score and destroy ranking discrimination.
    direction: "negative",
    susiKey: "under5_wasting_pct",
    status: "available",
  },

  {
    key: "breastfeeding",
    domain: "Health & Nutrition",
    label: "Age-appropriate breastfeeding",
    min: 0,
    max: 27,
    direction: "positive",
    status: "pending",
    pendingReason: "IYCF module required",
  },

  {
    key: "solid_foods",
    domain: "Health & Nutrition",
    label: "Introduction of solid, semi-solid or soft foods",
    min: 0,
    max: 74,
    direction: "positive",
    status: "pending",
    pendingReason: "IYCF module required",
  },

  {
    key: "dietary_diversity",
    domain: "Health & Nutrition",
    label: "Minimum dietary diversity",
    min: 0,
    max: 34,
    direction: "positive",
    status: "pending",
    pendingReason: "IYCF module required",
  },

  {
    key: "meal_frequency",
    domain: "Health & Nutrition",
    label: "Minimum meal frequency",
    min: 0,
    max: 40,
    direction: "positive",
    status: "pending",
    pendingReason: "IYCF module required",
  },

  {
    key: "immunization",
    domain: "Health & Nutrition",
    label: "Full immunization coverage",
    min: 0,
    max: 31,
    direction: "positive",
    status: "pending",
    pendingReason: "Immunization card records required",
  },

  // ==================================================================
  // EDUCATION & CHILD DEVELOPMENT (10 indicators — 4 currently available)
  // ==================================================================
  {
    key: "functional_schools",
    domain: "Education & Child Development",
    label: "Access to functional schools",
    min: 0,
    max: 3,
    direction: "positive",
    status: "pending",
    pendingReason: "Community-listing data source required",
  },

  {
    key: "primary_attendance",
    domain: "Education & Child Development",
    label: "Primary age attendance",
    min: 0,
    max: 61,
    direction: "positive",
    susiKey: "primary_age_attendance_pct",
    status: "available",
  },

  {
    key: "lower_sec_attendance",
    domain: "Education & Child Development",
    label: "Lower secondary attendance",
    min: 0,
    max: 48,
    direction: "positive",
    susiKey: "lower_secondary_attendance_pct",
    status: "available",
  },

  {
    key: "upper_sec_attendance",
    domain: "Education & Child Development",
    label: "Upper secondary attendance",
    min: 0,
    max: 47,
    direction: "positive",
    susiKey: "upper_secondary_attendance_pct",
    status: "available",
  },

  {
    key: "out_of_school",
    domain: "Education & Child Development",
    label: "Out-of-school rate",
    min: 0,
    max: 26,
    direction: "negative",
    susiKey: "out_of_school_rate_pct",
    status: "available",
  },

  {
    key: "dropout_primary",
    domain: "Education & Child Development",
    label: "Drop-out rate primary",
    min: 0,
    max: 27,
    direction: "negative",
    status: "pending",
    pendingReason: "Roadmap — partial data in SUSI",
  },

  {
    key: "ecd_participation",
    domain: "Education & Child Development",
    label: "ECD participation",
    min: 0,
    max: 38,
    direction: "positive",
    status: "pending",
    pendingReason: "Not asked in SUSI Batch 1",
  },

  {
    key: "birth_registration",
    domain: "Education & Child Development",
    label: "Birth registration",
    min: 0,
    max: 43,
    direction: "positive",
    status: "pending",
    pendingReason: "Roadmap — under-5 filter needed",
  },

  {
    key: "early_marriage",
    domain: "Education & Child Development",
    label: "Early marriage",
    min: 0,
    max: 40,
    direction: "negative",
    status: "pending",
    pendingReason: "Roadmap — girls 15-17 filter needed",
  },

  {
    key: "child_labour",
    domain: "Education & Child Development",
    label: "Child labour",
    min: 0,
    max: 39,
    direction: "negative",
    status: "pending",
    pendingReason: "Roadmap — needs child + labour columns",
  },

  // ==================================================================
  // LIVING STANDARDS (6 indicators — 0 currently available)
  // ==================================================================
  {
    key: "accessibility",
    domain: "Living Standards",
    label: "Accessibility (road type)",
    min: 0,
    max: 3,
    direction: "positive",
    status: "pending",
    pendingReason: "Community-listing data source required",
  },

  {
    key: "electricity",
    domain: "Living Standards",
    label: "Access to electricity/reliability",
    min: 0,
    max: 1,
    direction: "positive",
    status: "pending",
    pendingReason: "Community-listing data source required",
  },

  {
    key: "market_access",
    domain: "Living Standards",
    label: "Access to market",
    min: 0,
    max: 1,
    direction: "positive",
    status: "pending",
    pendingReason: "Community-listing data source required",
  },

  {
    key: "communications",
    domain: "Living Standards",
    label: "Tele and post communication coverage",
    min: 0,
    max: 1,
    direction: "positive",
    status: "pending",
    pendingReason: "Community-listing data source required",
  },

  {
    key: "water_source",
    domain: "Living Standards",
    label: "Source of water",
    min: 0,
    max: 3,
    direction: "positive",
    status: "pending",
    pendingReason: "Community-listing data source required",
  },

  {
    key: "financial_services",
    domain: "Living Standards",
    label: "Financial services",
    min: 0,
    max: 1,
    direction: "positive",
    status: "pending",
    pendingReason: "Community-listing data source required",
  },

  // ==================================================================
  // WORK & SHOCKS (7 indicators — 0 currently available)
  // ==================================================================
  {
    key: "natural_disasters",
    domain: "Work & Shocks",
    label: "Frequency of natural disasters",
    min: 0,
    max: 12,
    direction: "negative",
    status: "pending",
    pendingReason: "Community-listing data source required",
  },

  {
    key: "security_risks",
    domain: "Work & Shocks",
    label: "Frequency of security risks",
    min: 0,
    max: 240,
    direction: "negative",
    status: "pending",
    pendingReason: "Community-listing data source required",
  },

  {
    key: "security_outpost",
    domain: "Work & Shocks",
    label: "Security outpost",
    min: 0,
    max: 1,
    direction: "positive",
    status: "pending",
    pendingReason: "Community-listing data source required",
  },

  {
    key: "deaths_casualties",
    domain: "Work & Shocks",
    label: "Number of deaths/casualties",
    min: 0,
    max: 164,
    direction: "negative",
    status: "pending",
    pendingReason: "Community-listing data source required",
  },

  {
    key: "unemployment",
    domain: "Work & Shocks",
    label: "Rate of unemployment",
    min: 0,
    max: 5,
    direction: "negative",
    status: "pending",
    pendingReason: "Roadmap — approximation from labour columns",
  },

  {
    key: "youth_neet",
    domain: "Work & Shocks",
    label: "Youth NEET",
    min: 0,
    max: 13,
    direction: "negative",
    status: "pending",
    pendingReason: "Roadmap — approximation from age + labour",
  },

  {
    key: "female_labour",
    domain: "Work & Shocks",
    label: "Female labour force participation",
    min: 0,
    max: 79,
    direction: "positive",
    status: "pending",
    pendingReason: "Roadmap — approximation from sex + labour",
  },
];

// Just the indicators we can actually compute today
export const AVAILABLE_INDICATORS = INDICATOR_CATALOGUE.filter(
  (i) => i.status === "available",
);

// --------------------------------------------------------------------------
// Normalization: raw indicator value -> quartile score 0/1/2/3
// --------------------------------------------------------------------------

export function normalizeIndicator(
  def: IndicatorDef,
  rawValue: number,
): number {
  if (!Number.isFinite(rawValue)) return 0;

  const clamped = Math.max(def.min, Math.min(def.max, rawValue));
  const range = def.max - def.min;
  if (range <= 0) return 0;

  const q = (clamped - def.min) / range;
  let quartile: number;
  if (q <= 0.25) quartile = 0;
  else if (q <= 0.5) quartile = 1;
  else if (q <= 0.75) quartile = 2;
  else quartile = 3;

  return def.direction === "positive" ? quartile : 3 - quartile;
}

// --------------------------------------------------------------------------
// Domain + composite scores
// --------------------------------------------------------------------------

export interface DomainScore {
  domain: UnicefDomain;
  score: number | null;
  indicatorsUsed: number;
  indicatorsAvailable: number;
}

export interface CommunityRanking {
  state: string;
  lga: string;
  ward: string;
  community: string;
  domainScores: DomainScore[];
  compositeScore: number | null;
  compositePercent: number | null;
  rawIndicators: Record<string, number>;
  hasPartialCoverage: boolean;
}

const ALL_DOMAINS: UnicefDomain[] = [
  "Health & Nutrition",
  "Education & Child Development",
  "Living Standards",
  "Work & Shocks",
];

export function scoreRecord(rec: GeoRecord): {
  domainScores: DomainScore[];
  compositeScore: number | null;
  compositePercent: number | null;
  rawIndicators: Record<string, number>;
} {
  const rawIndicators: Record<string, number> = {};
  const domainScores: DomainScore[] = [];

  for (const domain of ALL_DOMAINS) {
    const domainDefs = INDICATOR_CATALOGUE.filter((i) => i.domain === domain);
    const availableDefs = domainDefs.filter((i) => i.status === "available");

    let scores: number[] = [];
    for (const def of availableDefs) {
      if (!def.susiKey || !rec.unicef) continue;
      const raw = rec.unicef[def.susiKey] as unknown as number;
      if (typeof raw !== "number" || !Number.isFinite(raw)) continue;
      rawIndicators[def.key] = raw;
      scores.push(normalizeIndicator(def, raw));
    }

    domainScores.push({
      domain,
      score: scores.length
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : null,
      indicatorsUsed: scores.length,
      indicatorsAvailable: domainDefs.length,
    });
  }

  const domainScoresNumeric = domainScores
    .map((d) => d.score)
    .filter((s): s is number => s !== null);

  const compositeScore = domainScoresNumeric.length
    ? domainScoresNumeric.reduce((a, b) => a + b, 0) /
      domainScoresNumeric.length
    : null;

  const compositePercent =
    compositeScore !== null ? (compositeScore / 3) * 100 : null;

  return { domainScores, compositeScore, compositePercent, rawIndicators };
}

// --------------------------------------------------------------------------
// Ranking
// --------------------------------------------------------------------------

export function rankCommunities(records: GeoRecord[]): CommunityRanking[] {
  const rankings: CommunityRanking[] = records
    .filter((r) => r.level === "community")
    .map((r) => {
      const { domainScores, compositeScore, compositePercent, rawIndicators } =
        scoreRecord(r);
      return {
        state: r.state ?? "",
        lga: r.lga ?? "",
        ward: r.ward ?? "",
        community: r.community ?? "",
        domainScores,
        compositeScore,
        compositePercent,
        rawIndicators,
        hasPartialCoverage: domainScores.some((d) => d.score === null),
      };
    });

  rankings.sort((a, b) => {
    if (a.compositeScore === null && b.compositeScore === null) return 0;
    if (a.compositeScore === null) return 1;
    if (b.compositeScore === null) return -1;
    return a.compositeScore - b.compositeScore;
  });

  return rankings;
}
