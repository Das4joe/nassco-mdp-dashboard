/**
 * TypeScript Data Model
 * ---------------------
 * Interfaces matching the pre-aggregated JSON files from scripts/aggregate.py (v3.4+).
 *
 * Every geographic level (national / state / LGA / ward / community) shares the
 * same GeoRecord shape. See scripts/aggregate.py file-header changelog for
 * methodology notes on each metric.
 *
 * v3.4 additions to ExtendedBlock:
 *   - age_bands_unicef     (UNICEF #4, #6 — 4 age bands x sex)
 *   - children_in_pvhh     (UNICEF #5)
 *   - children_in_risk_hh  (UNICEF #26)
 *   - oos_by_band          (UNICEF #12, #25 — OOS split into 6-14 vs 15-17)
 *   - no_health_insurance  (UNICEF #16)
 */

// ---------------------------------------------------------------------------
// Existing blocks (unchanged shape, unchanged semantics)
// ---------------------------------------------------------------------------

export interface NsrMetrics {
  total_households: number;
  total_individuals: number;
  total_female: number;
  total_male: number;
  children_under5: number;
  children_under18: number;
  elderly: number;
  pwd: number;
  orphans: number;
  avg_household_size: number;
  gender_parity: number;
  nin_verified: number;
  nin_eligible_adults: number;
  nin_total_members: number;
  nin_verification_rate: number;
  nin_coverage_all: number;
  urban_households: number;
  rural_households: number;
  urban_pct: number;
}

export interface UpdateMetrics {
  update_visits: number;
  updated_hh: number;
  new_entrants: number;
  exits: number;
  update_rate: number;
  net_change: number;
}

export interface VulnerabilityMetrics {
  pmt_mean: number;
  pmt_median: number;
  decile_distribution: Record<string, number>;
  poorest_households: number;
  poorest_pct: number;
  vulnerability_index: number;
  improved_roof_pct: number;
  improved_floor_pct: number;
  improved_toilet_pct: number;
  improved_water_pct: number;
}

export interface UnicefIndicators {
  primary_age_attendance_pct: number;
  lower_secondary_attendance_pct: number;
  upper_secondary_attendance_pct: number;
  out_of_school_rate_pct: number;

  under5_wasting_pct: number;
  under5_sam_pct: number;
  under5_mam_pct: number;

  denominators: {
    children_6_11: number;
    children_12_14: number;
    children_15_17: number;
    children_answered_6_11: number;
    children_answered_12_14: number;
    children_answered_15_17: number;
    under5_total: number;
    under5_screened: number;
  };

  coverage: {
    education_response_pct: number;
    muac_screening_pct: number;
  };
}

// ---------------------------------------------------------------------------
// ExtendedBlock — v3.4
// ---------------------------------------------------------------------------

export interface RateWithCounts {
  n: number;
  d: number;
  pct: number;
  note?: string;
}

export interface DistributionItem {
  label: string;
  count: number;
  pct: number;
}

export interface PyramidBand {
  band: string;
  male: number;
  female: number;
  total: number;
}

export interface LivelihoodCode {
  code: string;
  label: string;
  count: number;
  pct: number;
}

export interface MuacHistogramBin {
  bin: string;
  count: number;
}

// -- v3.4 UNICEF-aligned additions --

export interface UnicefAgeBand {
  band: string;
  male: number;
  female: number;
  total: number;
}

export interface ChildrenInPvhh {
  n: number;
  d: number;
  pct: number;
  pvhh_household_count: number;
  note?: string;
}

export interface ChildrenInRiskHh {
  n: number;
  d: number;
  pct: number;
  risk_household_count: number;
  note?: string;
}

export interface OosBandEntry {
  n: number;
  d: number;
  pct: number;
  total_in_band: number;
}

export interface OosByBand {
  age_6_14: OosBandEntry;
  age_15_17: OosBandEntry;
  combined_6_17: OosBandEntry;
}

export interface NoHealthInsurance {
  n: number;
  d: number;
  pct: number;
  note?: string;
}

// -- Full ExtendedBlock --

export interface ExtendedBlock {
  age_sex_pyramid: PyramidBand[];
  marital_status: DistributionItem[];
  female_primary_respondent: RateWithCounts;

  birth_cert: {
    under_5: RateWithCounts;
    age_6_17: RateWithCounts;
    all_children: RateWithCounts;
  };

  individual_nin: {
    children: RateWithCounts;
    adults: RateWithCounts;
    all: RateWithCounts;
  };

  disability: {
    rate: RateWithCounts;
    types: DistributionItem[];
  };

  chronic_illness: {
    rate: RateWithCounts;
    types: DistributionItem[];
  };

  housing: {
    roof: DistributionItem[];
    floor: DistributionItem[];
    toilet: DistributionItem[];
    water: DistributionItem[];
    light: DistributionItem[];
    cook: DistributionItem[];
  };

  healthcare_access: {
    benefits_pct: RateWithCounts;
    distance_dist: DistributionItem[];
    distance_coverage_pct: number;
  };

  livelihoods: {
    labour_status: DistributionItem[];
    industry: DistributionItem[];
    code_dist: LivelihoodCode[];
  };

  shocks: {
    exposure_pct: RateWithCounts;
    types: DistributionItem[];
    years: DistributionItem[];
  };

  coping: {
    mechanisms: DistributionItem[];
    coverage_pct: number;
    shock_exposed_hh: number;
  };

  assistance_awareness: {
    asked_n: number;
    rutf_yes_pct: number;
    food_yes_pct: number;
    cash_yes_pct: number;
    dontknow_yes_pct: number;
  };

  plw: {
    women_repro_age: number;
    pregnant: RateWithCounts;
    lactating: RateWithCounts;
  };

  muac_distribution: {
    histogram: MuacHistogramBin[];
    categories: { Green: number; Yellow: number; Red: number };
    measured_n: number;
  };

  // v3.4 UNICEF-aligned additions
  age_bands_unicef: UnicefAgeBand[];
  children_in_pvhh: ChildrenInPvhh;
  children_in_risk_hh: ChildrenInRiskHh;
  oos_by_band: OosByBand;
  no_health_insurance: NoHealthInsurance;
}

// ---------------------------------------------------------------------------
// Top-level GeoRecord and DashboardData
// ---------------------------------------------------------------------------

export interface GeoRecord {
  nsr: NsrMetrics;
  update: UpdateMetrics;
  vulnerability: VulnerabilityMetrics;
  unicef?: UnicefIndicators;
  extended?: ExtendedBlock;
  level: "national" | "state" | "lga" | "ward" | "community";
  state?: string;
  lga?: string;
  ward?: string;
  community?: string;
}

export interface TimeseriesPoint {
  state: string;
  month: string;
  households: number;
  individuals: number;
  nin_verified: number;
  pmt_mean: number;
}

export interface DataMetadata {
  generated_at: string;
  source_csv?: string;
  source_file?: string;
  row_count?: number;
  source_rows?: number;
  household_count?: number;
  total_households?: number;
  total_members?: number;
  state_count?: number;
  states?: string[];
  lga_count: number;
  ward_count: number;
  community_count: number;
  mdp_states?: string[];
  data_modes?: string[];
  update_note?: string;
  unicef_indicators_available?: string[];
  unicef_indicators_pending_source?: string[];
  aggregator_version?: string;
  code_maps?: {
    disability?: Record<string, string>;
    chronic_ill?: Record<string, string>;
    livelihood?: Record<string, string>;
  };
  notes?: Record<string, string>;
}

export type DashboardMode = "nsr" | "update";

export interface DrilldownPath {
  state?: string;
  lga?: string;
  ward?: string;
  community?: string;
}

export type InsightSeverity = "success" | "warning" | "danger" | "info";

export interface InsightFlag {
  severity: InsightSeverity;
  title: string;
  detail: string;
  location?: string;
}

export interface RankedItem {
  rank: number;
  name: string;
  value: number;
  sublabel?: string;
  state?: string;
}
