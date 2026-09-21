/**
 * NASSCO MDP Dashboard — Type Definitions
 * Version 4.0.0 (UNICEF Revamp)
 *
 * Ground rules:
 * - DashboardData is exported from loadData.ts, NOT from this file.
 * - All new V4 properties in ExtendedBlock are marked optional (?) for safety across geo grains.
 */

export type GeoLevel = "national" | "state" | "lga" | "ward" | "community";
export type DashboardMode = "nsr" | "update";

export interface DrilldownPath {
  state?: string;
  lga?: string;
  ward?: string;
  community?: string;
}

/** Matches StatusDot COLOR_CLASS + insights.ts usage */
export type InsightSeverity = "success" | "warning" | "danger" | "info";

export interface InsightFlag {
  id?: string;
  severity: InsightSeverity;
  category?: string;
  title: string;
  body?: string;
  detail?: string;
  location?: string;
  metric?: string;
  value?: string | number;
  actionText?: string;
  linkTab?: string;
}

export interface RankedItem {
  id?: string;
  rank: number;
  name: string;
  value?: number;
  score?: number;
  sublabel?: string;
  state?: string;
  lga?: string;
  ward?: string;
  community?: string;
  indicators?: Record<string, number>;
}

export interface TimeseriesPoint {
  state: string;
  month: string;
  households: number;
  individuals: number;
  nin_verified: number;
  pmt_mean: number;
}

export type TimeseriesRow = TimeseriesPoint;

export interface UnicefIndicators {
  primary_attendance: number;
  lower_sec_attendance: number;
  upper_sec_attendance: number;
  out_of_school: number;
  under5_wasting: number;
  [key: string]: number;
}

export interface NsrBlock {
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

export interface UpdateBlock {
  update_visits: number;
  updated_hh: number;
  new_entrants: number;
  exits: number;
  update_rate: number;
  net_change: number;
}

export interface VulnerabilityBlock {
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

export interface UnicefBlock {
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
  [key: string]: any;
}

// ---------------------------------------------------------------------------
// V4 UNICEF Revamp Sub-Interfaces
// ---------------------------------------------------------------------------

export interface GenderBreakdownCount {
  total: number;
  male: number;
  female: number;
}

export interface AgeBandsV2 {
  "0-3": GenderBreakdownCount;
  "0-5": GenderBreakdownCount;
  "0-7": GenderBreakdownCount;
  "0-17": GenderBreakdownCount;
  "6-9": GenderBreakdownCount;
  "10-14": GenderBreakdownCount;
  "15-17": GenderBreakdownCount;
  "18-24": GenderBreakdownCount;
}

export interface CivilRegGroup {
  total: number;
  birth_cert_yes: number;
  birth_cert_no: number;
  birth_cert_pct: number;
  nin_yes: number;
  nin_no: number;
  nin_pct: number;
  both: number;
  both_pct: number;
  cert_only: number;
  cert_only_pct: number;
  nin_only: number;
  nin_only_pct: number;
  neither: number;
  neither_pct: number;
  by_gender: {
    male: {
      total: number;
      birth_cert_yes: number;
      nin_yes: number;
      birth_cert_pct: number;
      nin_pct: number;
    };
    female: {
      total: number;
      birth_cert_yes: number;
      nin_yes: number;
      birth_cert_pct: number;
      nin_pct: number;
    };
  };
}

export interface CivilRegistrationBlock {
  children_0_17: CivilRegGroup;
  children_0_5: CivilRegGroup;
  adults: CivilRegGroup;
}

export interface OosBand {
  total: number;
  oos: number;
  enrolled: number;
  oos_pct: number;
  male: {
    total: number;
    oos: number;
    oos_pct: number;
  };
  female: {
    total: number;
    oos: number;
    oos_pct: number;
  };
}

export interface EducationV2Block {
  oos_6_17: OosBand;
  oos_6_9: OosBand;
  oos_10_14: OosBand;
  oos_15_17: OosBand;
  oos_6_14: OosBand;
  disabled_children: {
    total: number;
    oos: number;
    enrolled: number;
    oos_pct: number;
  };
  grade_distribution: Array<{ label: string; count: number; pct: number }>;
  oos_grade_distribution: Array<{ label: string; count: number; pct: number }>;
  dropout_period: Array<{ label: string; count: number; pct: number }>;
}

export interface NutritionV2Block {
  eligible_under5: number;
  sam_count: number;
  mam_count: number;
  normal_count: number;
  wasted_count: number;
  sam_pct: number;
  mam_pct: number;
  normal_pct: number;
  wasting_pct: number;
  by_gender: {
    male: { total: number; sam: number; mam: number; wasting_pct: number };
    female: { total: number; sam: number; mam: number; wasting_pct: number };
  };
  placeholders: {
    pregnant_enrolled_fn: { status: string; label: string };
    malnourished_children_enrolled_fn: { status: string; label: string };
  };
}

export interface HealthV2Block {
  pregnant_total: number;
  pregnant_caveat: string;
  pregnant_by_age: {
    under_18: number;
    "18_24": number;
    "25_34": number;
    "35_plus": number;
  };
  lactating_total: number;
  lactating_caveat: string;
  plwd_total: number;
  plwd_male: number;
  plwd_female: number;
  plwd_pct: number;
  children_plwd: number;
  children_plwd_pct: number;
  placeholders: {
    hhs_with_health_insurance: { status: string; label: string };
    health_insurance_type: { status: string; label: string };
    hhs_with_no_health_insurance: { status: string; label: string };
    children_0_7_covered_insurance: { status: string; label: string };
    children_0_5_covered_insurance: { status: string; label: string };
  };
}

export interface YouthBlock {
  total: number;
  employed: number;
  unemployed: number;
  student: number;
  unemployment_rate: number;
  labour_breakdown: Array<{ label: string; count: number; pct: number }>;
}

export interface LivelihoodsResilienceV2Block {
  livelihoods: Array<{ label: string; count: number; pct: number }>;
  large_households: { count: number; pct: number };
  multi_vulnerable_households: { count: number; pct: number };
  hh_with_disability: { count: number; pct: number };
  shock_exposure: {
    shock_hh_count: number;
    shock_hh_pct: number;
    types: Array<{ type: string; label?: string; count: number; pct: number }>;
    coping_mechanisms: Array<{ label: string; count: number; pct: number }>;
  };
}

// ---------------------------------------------------------------------------
// Main Extended Block Interface
// ---------------------------------------------------------------------------

export interface ExtendedBlock {
  age_sex_pyramid: Array<{
    band: string;
    male: number;
    female: number;
    total: number;
  }>;
  marital_status: Array<{ label: string; count: number; pct: number }>;
  female_primary_respondent: {
    n: number;
    d: number;
    pct: number;
    note: string;
  };
  birth_cert: {
    under_5: { n: number; d: number; pct: number };
    age_6_17: { n: number; d: number; pct: number };
    all_children: { n: number; d: number; pct: number };
  };
  individual_nin: {
    children: { n: number; d: number; pct: number };
    adults: { n: number; d: number; pct: number };
    all: { n: number; d: number; pct: number };
  };
  disability: {
    rate: { n: number; d: number; pct: number };
    types: Array<{ label: string; count: number; pct: number }>;
  };
  chronic_illness: {
    rate: { n: number; d: number; pct: number };
    types: Array<{ label: string; count: number; pct: number }>;
  };
  housing: {
    roof: Array<{ label: string; count: number; pct: number }>;
    floor: Array<{ label: string; count: number; pct: number }>;
    toilet: Array<{ label: string; count: number; pct: number }>;
    water: Array<{ label: string; count: number; pct: number }>;
    light: Array<{ label: string; count: number; pct: number }>;
    cook: Array<{ label: string; count: number; pct: number }>;
  };
  healthcare_access: {
    benefits_pct: { n: number; d: number; pct: number };
    distance_dist: Array<{ label: string; count: number; pct: number }>;
    distance_coverage_pct: number;
  };
  livelihoods: {
    labour_status: Array<{ label: string; count: number; pct: number }>;
    industry: Array<{ label: string; count: number; pct: number }>;
    code_dist: Array<{ label: string; count: number; pct: number }>;
  };
  shocks: {
    exposure_pct: { n: number; d: number; pct: number };
    types: Array<{ type: string; label?: string; count: number; pct: number }>;
    years: Array<{ label: string; count: number; pct: number }>;
  };
  coping: {
    mechanisms: Array<{ label: string; count: number; pct: number }>;
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
    pregnant: { n: number; d: number; pct: number };
    lactating: { n: number; d: number; pct: number };
  };
  muac_distribution: {
    histogram: Array<{ bin: string; count: number }>;
    categories: Record<string, number>;
    measured_n: number;
  };
  age_bands_unicef: Array<{
    band: string;
    male: number;
    female: number;
    total: number;
  }>;
  children_in_pvhh: { n: number; d: number; pct: number };
  children_in_risk_hh: { n: number; d: number; pct: number };
  oos_by_band: Record<
    string,
    { n: number; d: number; total_in_band?: number; pct: number }
  >;
  no_health_insurance: { n: number; d: number; pct: number; note: string };

  // V4 UNICEF Revamp Extensions
  age_bands_v2?: AgeBandsV2;
  civil_registration?: CivilRegistrationBlock;
  education_v2?: EducationV2Block;
  nutrition_v2?: NutritionV2Block;
  health_v2?: HealthV2Block;
  youth?: YouthBlock;
  livelihoods_resilience_v2?: LivelihoodsResilienceV2Block;
}

export interface GeoRecord {
  nsr: NsrBlock;
  update: UpdateBlock;
  vulnerability: VulnerabilityBlock;
  unicef: UnicefBlock;
  extended: ExtendedBlock;
  level: GeoLevel;
  state?: string;
  lga?: string;
  ward?: string;
  community?: string;
}

export interface DataMetadata {
  generated_at: string;
  source_csv: string;
  source_rows: number;
  total_households: number;
  total_members: number;
  states_count: number;
  lga_count: number;
  ward_count: number;
  community_count: number;
  mdp_states: string[];
  data_modes: string[];
  aggregator_version: string;
  code_maps: Record<string, Record<string, string | number>>;
}
