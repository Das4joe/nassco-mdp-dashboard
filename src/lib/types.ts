export type GeoLevel = "national" | "state" | "lga" | "ward" | "community";
export type DashboardMode = "nsr" | "update";

export interface DrilldownPath {
  state?: string;
  lga?: string;
  ward?: string;
  community?: string;
}

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
  orphans?: number;
  avg_household_size?: number;
  gender_parity?: number;
  nin_verified?: number;
  nin_eligible_adults?: number;
  nin_total_members?: number;
  nin_verification_rate: number;
  nin_coverage_all?: number;
  urban_households?: number;
  rural_households?: number;
  urban_pct?: number;
}

export interface UpdateBlock {
  update_visits?: number;
  updated_hh?: number;
  new_entrants?: number;
  exits?: number;
  update_rate?: number;
  net_change?: number;
}

export interface VulnerabilityBlock {
  pmt_mean?: number;
  pmt_median?: number;
  decile_distribution?: Record<string, number>;
  poorest_households: number;
  poorest_pct: number;
  vulnerability_index: number;
  improved_roof_pct?: number;
  improved_floor_pct?: number;
  improved_toilet_pct?: number;
  improved_water_pct?: number;
}

export interface UnicefBlock {
  primary_age_attendance_pct?: number;
  lower_secondary_attendance_pct?: number;
  upper_secondary_attendance_pct?: number;
  out_of_school_rate_pct: number;
  under5_wasting_pct: number;
  under5_sam_pct?: number;
  under5_mam_pct?: number;
  [key: string]: any;
}

export interface GenderBreakdownCount {
  total: number;
  male: number;
  female: number;
}

export interface AgeBandsV2 {
  "0-3": GenderBreakdownCount;
  "0-5": GenderBreakdownCount;
  "0-7"?: GenderBreakdownCount;
  "0-17": GenderBreakdownCount;
  "6-9"?: GenderBreakdownCount;
  "10-14"?: GenderBreakdownCount;
  "15-17"?: GenderBreakdownCount;
  "18-24": GenderBreakdownCount;
}

export interface CivilRegGroup {
  total?: number;
  birth_cert_yes: number;
  birth_cert_no: number;
  birth_cert_pct?: number;
  nin_yes: number;
  nin_no: number;
  nin_pct?: number;
  both: number;
  both_pct?: number;
  cert_only: number;
  cert_only_pct?: number;
  nin_only: number;
  nin_only_pct?: number;
  neither: number;
  neither_pct?: number;
  by_gender?: {
    male: {
      birth_cert_yes: number;
      nin_yes: number;
    };
    female: {
      birth_cert_yes: number;
      nin_yes: number;
    };
  };
}

export interface CivilRegistrationBlock {
  children_0_17: CivilRegGroup;
  children_0_5: CivilRegGroup;
  adults?: CivilRegGroup;
}

export interface OosBand {
  total?: number;
  oos: number;
  enrolled?: number;
  oos_pct?: number;
  male: {
    oos: number;
  };
  female: {
    oos: number;
  };
}

export interface EducationV2Block {
  oos_6_17: OosBand;
  oos_6_9: OosBand;
  oos_10_14: OosBand;
  oos_15_17: OosBand;
  disabled_children: {
    oos: number;
  };
}

export interface NutritionV2Block {
  sam_count: number;
  mam_count: number;
  normal_count: number;
  wasting_pct?: number;
}

export interface HealthV2Block {
  pregnant_total: number;
  lactating_total: number;
  plwd_total: number;
  children_plwd: number;
  children_0_5_insurance?: number;
  children_0_7_insurance?: number;
  children_0_5_no_insurance?: number;
  children_0_7_no_insurance?: number;
}

export interface YouthBlock {
  employed: number;
  unemployed: number;
}

export interface LivelihoodsResilienceV2Block {
  shock_exposure: {
    shock_hh_count: number;
    shock_hh_pct?: number;
  };
}

export interface ExtendedBlock {
  age_sex_pyramid?: Array<{
    band: string;
    male: number;
    female: number;
    total: number;
  }>;
  disability?: {
    rate?: { n: number; pct: number };
    types?: Array<{ label: string; count: number }>;
  };
  plw?: {
    pregnant: { n: number };
    lactating: { n: number };
  };
  children_in_risk_hh?: { n: number };
  female_primary_respondent?: { n: number; pct?: number };
  children_in_pvhh?: { n: number; pct: number };
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
  update?: UpdateBlock;
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
}
