export type GeoLevel = "national" | "state" | "lga" | "ward" | "community";

export type DomainId =
  | "overview"
  | "demographics"
  | "civil_registration"
  | "civil_reg"
  | "education"
  | "health_nutrition"
  | "disabilities"
  | "livelihoods"
  | "livelihoods_resilience";

export interface DrilldownPath {
  state: string | null;
  lga: string | null;
  ward?: string | null;
  community: string | null;
}

export interface GeoRecord {
  id?: string;
  name?: string;
  level?: GeoLevel | string;
  state_name?: string;
  lga_name?: string;
  ward_name?: string;
  community_name?: string;

  // Demographics
  total_households?: number;
  households?: number;
  total_individuals?: number;
  individuals?: number;
  male?: number;
  female?: number;
  children_0_17?: number;
  children_6_15?: number;
  children_under_5?: number;
  youth_18_24?: number;
  adults_25_59?: number;
  elderly_60_plus?: number;

  // Civil Registration
  birth_cert_has?: number;
  birth_cert_pct?: number;
  nin_has?: number;
  nin_pct?: number;

  // Education
  oosc_count?: number;
  oosc_rate?: number;
  edu_never_enrolled?: number;
  edu_dropped_out?: number;

  // Health & Nutrition
  muac_red_sam?: number;
  muac_yellow_mam?: number;
  chronic_illness_count?: number;
  health_insurance_count?: number;

  // Disabilities (PLWD)
  pwd_count?: number;
  pwd_vision?: number;
  pwd_hearing?: number;
  pwd_mobility?: number;
  pwd_cognitive?: number;
  pwd_selfcare?: number;

  // Livelihoods & Resilience
  female_headed_hh?: number;
  female_headed_pct?: number;
  subsistence_farming_pct?: number;
  zero_productive_assets_pct?: number;
  emergency_coping_pct?: number;
  access_to_credit_pct?: number;

  [key: string]: any;
}
