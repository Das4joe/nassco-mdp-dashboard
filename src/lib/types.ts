export type GeoLevel = "national" | "state" | "lga" | "ward" | "community";

export type DashboardMode =
  | "overview"
  | "comparison"
  | "ranking"
  | "nsr"
  | "vulnerability"
  | "update"
  | (string & {});

export type DomainId =
  | "overview"
  | "civil-registration"
  | "civil_registration"
  | "education"
  | "health-nutrition"
  | "health_nutrition"
  | "disabilities"
  | "livelihoods"
  | "livelihood";

export type InsightSeverity =
  | "critical"
  | "warning"
  | "info"
  | "positive"
  | "high"
  | "medium"
  | "low";

export interface InsightFlag {
  id: string;
  domain: DomainId | string;
  title: string;
  category?: string;
  description: string;
  message?: string;
  severity: InsightSeverity;
  metric: string;
  value: number | string;
  geoName: string;
  geoLevel: GeoLevel;
  [key: string]: any;
}

export interface RankedItem {
  id: string;
  name: string;
  level?: GeoLevel;
  state?: string;
  lga?: string;
  ward?: string;
  community?: string;
  total_hh?: number;
  total_ind?: number;
  score?: number;
  rank?: number;
  decile?: number;
  value?: number;
  formattedValue?: string;
  sublabel?: string;
  domain_scores?: Record<string, number>;
  indicators?: Record<string, number>;
  [key: string]: any;
}

export interface DataMetadata {
  total_households?: number;
  total_hh?: number;
  total_individuals?: number;
  total_ind?: number;
  states_count?: number;
  total_states?: number;
  lgas_count?: number;
  total_lgas?: number;
  wards_count?: number;
  total_wards?: number;
  communities_count?: number;
  total_communities?: number;
  last_updated?: string;
  [key: string]: any;
}

export type DashboardMetadata = DataMetadata;

export interface Demographics {
  total_hh: number;
  households?: number;
  total_individuals: number;
  total_ind?: number;
  males: number;
  females: number;
  children_0_17: number;
  children_0_17_total?: number;
  children_0_5: number;
  children_6_11: number;
  children_12_17: number;
  youth_18_24: number;
  adults_18_59: number;
  elderly_60_plus: number;
  female_headed_hh: number;
  children_males_0_17: number;
  children_females_0_17: number;
  pyramid?: Array<{
    age_cohort: string;
    male: number;
    female: number;
    [key: string]: any;
  }>;
  gender_distribution?: { male?: number; female?: number; [key: string]: any };
  male_population?: number;
  female_population?: number;
  total_children?: number;
  youth_18_24_total?: number;
  total_youth?: number;
  adults_25_59_total?: number;
  total_adults?: number;
  elderly_60_plus_total?: number;
  total_elderly?: number;
  [key: string]: any;
}

export interface CivilRegistrationData {
  children_without_birth_certificate: number;
  children_no_bc?: number;
  children_without_nin: number;
  children_no_nin?: number;
  children_without_bc_and_nin: number;
  children_no_bc_and_nin?: number;
  children_with_bc_and_nin: number;
  children_with_both?: number;
  no_bc_under_1: number;
  no_bc_1_to_4: number;
  no_bc_5_to_9: number;
  no_bc_10_to_17: number;
  no_nin_under_1: number;
  no_nin_1_to_4: number;
  no_nin_5_to_9: number;
  no_nin_10_to_17: number;
  no_bc_male_children: number;
  no_bc_female_children: number;
  no_nin_male_children: number;
  no_nin_female_children: number;
  adults_no_nin: number;
  adults_no_bc: number;
  adults_no_both: number;
  total_with_bc_and_nin?: number;
  total_with_both_pct?: number;
  children_without_bc?: number;
  [key: string]: any;
}

export interface EducationData {
  oos_children_6_17: number;
  oosc_total?: number;
  oos_male_6_17: number;
  oosc_male?: number;
  oos_female_6_17: number;
  oosc_female?: number;
  never_enrolled_6_17: number;
  never_enrolled_male: number;
  never_enrolled_female: number;
  dropped_out_6_17: number;
  dropped_out_male: number;
  dropped_out_female: number;
  oos_6_11: number;
  oos_12_14: number;
  oos_15_17: number;
  never_enrolled_6_11: number;
  never_enrolled_12_14: number;
  never_enrolled_15_17: number;
  dropped_out_6_11: number;
  dropped_out_12_14: number;
  dropped_out_15_17: number;
  girls_oos_6_11: number;
  girls_oos_12_14: number;
  girls_oos_15_17: number;
  oos_by_age?: any[];
  never_enrolled_by_age_and_gender?: any[];
  never_enrolled_by_age?: any[];
  dropouts_by_age_and_gender?: any[];
  dropouts_by_age?: any[];
  girls_out_of_school_by_level?: any[];
  girls_oos_by_age?: any[];
  out_of_school_6_17_total?: number;
  out_of_school_total?: number;
  [key: string]: any;
}

export interface HealthNutritionData {
  pregnant_women: number;
  lactating_mothers: number;
  children_muac_screened: number;
  muac_normal_green: number;
  muac_moderate_yellow: number;
  muac_severe_red: number;
  hh_with_health_insurance: number;
  hh_with_nutrition_access: number;
  illness_under_5: number;
  illness_5_to_17: number;
  illness_18_to_59: number;
  illness_60_plus: number;
  illness_males: number;
  illness_females: number;
  food_support_received: number;
  food_support_needed: number;
  pregnant_women_total?: number;
  pregnant_women_count?: number;
  lactating_mothers_total?: number;
  lactating_mothers_count?: number;
  muac_status?: {
    normal?: number;
    moderate?: number;
    severe?: number;
    [key: string]: any;
  };
  muac_normal_count?: number;
  muac_moderate_count?: number;
  muac_severe_count?: number;
  household_health_insurance_pct?: number;
  access_to_nutrition_services_pct?: number;
  nutrition_services_access_pct?: number;
  children_muac_distribution?: any[];
  chronic_illness_by_age_and_gender?: any[];
  chronic_illness_by_age?: any[];
  access_to_food_support?: any[];
  food_support_by_age?: any[];
  [key: string]: any;
}

export interface DisabilitiesData {
  total_plwd: number;
  pwd_total?: number;
  children_plwd: number;
  pwd_children?: number;
  adults_plwd: number;
  pwd_adults?: number;
  boys_plwd: number;
  girls_plwd: number;
  men_plwd: number;
  women_plwd: number;
  visual_impairment: number;
  hearing_impairment: number;
  physical_impairment: number;
  intellectual_impairment: number;
  multiple_impairments: number;
  children_visual: number;
  children_hearing: number;
  children_physical: number;
  children_intellectual: number;
  [key: string]: any;
}

export interface LivelihoodsShocksData {
  crop_farming: number;
  livestock_rearing: number;
  informal_commerce: number;
  wage_labor: number;
  formal_employment: number;
  artisanal_crafts: number;
  youth_18_24_employed: number;
  youth_18_24_unemployed: number;
  youth_18_24_in_education: number;
  shock_flood: number;
  shock_drought: number;
  shock_conflict: number;
  shock_food_price_hike: number;
  shock_illness_death: number;
  coping_sold_assets: number;
  coping_reduced_meals: number;
  coping_borrowed_money: number;
  coping_withdrew_children_school: number;
  coping_child_labor: number;
  female_headed_households_pct?: number;
  main_livelihood_source?: string;
  youth_employed_18_24_pct?: number;
  negative_coping_households_pct?: number;
  child_coping_households_pct?: number;
  livelihood_sources?: any[];
  youth_economic_activity?: any[];
  shock_exposure?: any[];
  coping_strategies?: any[];
  [key: string]: any;
}

export type UnicefIndicators = Record<string, number | unknown>;

export interface GeoRecord {
  id: string;
  name: string;
  level: GeoLevel;
  state?: string;
  lga?: string;
  ward?: string;
  community?: string;
  demographics: Demographics;
  civil_registration: CivilRegistrationData;
  education: EducationData;
  health_nutrition: HealthNutritionData;
  disabilities: DisabilitiesData;
  livelihoods_shocks: LivelihoodsShocksData;
  unicef_indicators?: UnicefIndicators;
  households?: number;
  total_hh?: number;
  total_households?: number;
  individuals?: number;
  total_ind?: number;
  total_individuals?: number;
  communities_covered?: number;
  coverage?: { communities_count?: number; [key: string]: any };
  nsr?: any;
  update?: any;
  vulnerability?: any;
  unicef?: Record<string, any>;
  livelihoods?: any;
  [key: string]: any;
}

export interface DashboardData {
  metadata: DataMetadata;
  national: GeoRecord;
  states: GeoRecord[];
  lgas: GeoRecord[];
  wards: GeoRecord[];
  communities: GeoRecord[];
}

export interface DrilldownPath {
  level?: GeoLevel;
  state?: string | null;
  lga?: string | null;
  ward?: string | null;
  community?: string | null;
}
