export type DashboardMode =
  | "nsr"
  | "deprivation"
  | "vulnerability"
  | "insights"
  | string;
export type InsightSeverity =
  | "critical"
  | "warning"
  | "info"
  | "success"
  | string;

export interface DataMetadata {
  last_updated?: string;
  source?: string;
  total_records?: number;
  updated_hh_total?: number;
  nsr_hh_total?: number;
  mdp_states?: string[];
  total_households?: number;
}

export interface InsightFlag {
  id: string;
  title: string;
  severity: InsightSeverity;
  category: string;
  body?: string;
  location?: string;
  metricValue?: string | number;
  description?: string;
  actionText?: string;
}

export interface RankedItem {
  id?: string;
  name: string;
  state?: string;
  lga?: string;
  ward?: string;
  score?: number;
  rank: number;
  metric?: string;
  value?: number;
  sublabel?: string;
}

export interface UnicefIndicators {
  [key: string]: any;
}

export interface DrilldownPath {
  state?: string;
  lga?: string;
  ward?: string;
  community?: string;
}

export interface NsrBlock {
  total_households: number;
  total_individuals: number;
  total_male: number;
  total_female: number;
  children_under18: number;
  children_under5: number;
  children_0_17?: number;
  children_0_5?: number;
  youth_18_24?: number;
  pwd: number;
  plwd?: number;
  children_plwd?: number;
  children_with_disabilities?: number;
  pregnant_total?: number;
  pregnant_women?: number;
  lactating_total?: number;
  lactating_mothers?: number;
  nin_verification_rate?: number;
  nin_verified?: number;
  nin_eligible_adults?: number;
}

export interface AgeBandGroup {
  total: number;
  male: number;
  female: number;
}

export interface PyramidBand {
  band: string;
  ageGroup?: string;
  male: number;
  female: number;
  boys?: number;
  girls?: number;
  total: number;
}

export interface EducationOosGender {
  oos: number;
}

export interface EducationOosCohort {
  oos: number;
  male: EducationOosGender;
  female: EducationOosGender;
}

export interface EducationV2 {
  oos_6_17: EducationOosCohort;
  oos_6_9: EducationOosCohort;
  oos_10_14: EducationOosCohort;
  oos_15_17: EducationOosCohort;
  disabled_children: EducationOosGender;
}

export interface CivilRegistrationV2 {
  c_0_17_with_bc: number;
  c_0_5_with_bc: number;
  c_0_17_no_bc: number;
  c_0_5_no_bc: number;
  c_0_17_with_nin: number;
  c_0_5_with_nin: number;
  c_0_17_no_nin: number;
  c_0_5_no_nin: number;
  c_0_17_no_bc_no_nin: number;
  c_0_5_no_bc_no_nin: number;
  c_0_17_bc_no_nin: number;
  c_0_5_bc_no_nin: number;
  c_0_17_nin_no_bc: number;
  c_0_5_nin_no_bc: number;
  bc_by_gender?: {
    boys_with_bc: number;
    girls_with_bc: number;
    boys_no_bc: number;
    girls_no_bc: number;
  };
  nin_by_gender?: {
    boys_with_nin: number;
    girls_with_nin: number;
    boys_no_nin: number;
    girls_no_nin: number;
  };
}

export interface HealthV2 {
  pregnant_total: number;
  lactating_total: number;
  plwd_total: number;
  children_plwd: number;
  health_insurance_0_7_covered: number;
  health_insurance_0_7_not_covered: number;
  health_insurance_0_5_covered: number;
  health_insurance_0_5_not_covered: number;
}

export interface NutritionV2 {
  pregnant_total: number;
  lactating_total: number;
  sam_children: number;
  mam_children: number;
  normal_children: number;
}

export interface LivelihoodsV2 {
  female_headed_hhs: number;
  youth_employed: number;
  youth_unemployed: number;
  shock_prone_hhs: number;
  children_in_risk_hhs: number;
}

export interface ExtendedData {
  age_sex_pyramid?: PyramidBand[];
  age_bands_v2?: Record<string, AgeBandGroup>;
  civil_registration?: CivilRegistrationV2;
  education_v2?: EducationV2;
  health_v2?: HealthV2;
  nutrition_v2?: NutritionV2;
  livelihoods_resilience_v2?: LivelihoodsV2;
}

export interface VulnerabilityBlock {
  poorest_households?: number;
  poorest_pct?: number;
  vulnerability_index?: number;
  decile_distribution?: Record<string, number>;
  pmt_mean?: number;
}

export interface UpdateBlock {
  updated_hh?: number;
}

export interface GeoRecord {
  state?: string;
  lga?: string;
  ward?: string;
  community?: string;
  level?: string;
  pvhhs?: number;
  males?: number;
  females?: number;
  ages_0_17?: number;
  ages_18_above?: number;
  nsr: NsrBlock;
  extended?: ExtendedData;
  vulnerability?: VulnerabilityBlock;
  update?: UpdateBlock;
  unicef?: Record<string, any>;
  total_households?: number;
  total_individuals?: number;
  children_0_17?: number;
  children_0_5?: number;
  youth_18_24?: number;
  plwd?: number;
  children_with_disabilities?: number;
  pregnant_women?: number;
  lactating_mothers?: number;
  pyramid_0_24?: PyramidBand[];
  gender_ratio?: { boys: number; girls: number };
  civil_registration?: CivilRegistrationV2;
  education?: EducationV2;
  health_nutrition?: HealthV2;
  nutrition?: NutritionV2;
  livelihoods?: LivelihoodsV2;
}
