import type {
  GeoRecord,
  DashboardData,
  DataMetadata,
  Demographics,
  CivilRegistrationData,
  EducationData,
  HealthNutritionData,
  DisabilitiesData,
  LivelihoodsShocksData,
} from "./types";

const DATA_BASE_URL = "/data";

function sanitizeDemographics(raw: any = {}): Demographics {
  const src = raw.demographics || raw;
  const total_ind =
    src.total_individuals ??
    src.total_ind ??
    src.total_records ??
    raw.total_individuals ??
    0;
  const total_hh =
    src.total_hh ??
    src.households ??
    src.total_households ??
    src.pvhhs ??
    raw.total_households ??
    0;
  return {
    total_hh,
    households: total_hh,
    total_individuals: total_ind,
    total_ind,
    males: src.males ?? src.total_male ?? raw.males ?? 0,
    females: src.females ?? src.total_female ?? raw.females ?? 0,
    children_0_17:
      src.children_0_17 ??
      src.children_0_17_total ??
      src.ages_0_17 ??
      raw.children_0_17 ??
      0,
    children_0_17_total:
      src.children_0_17_total ?? src.children_0_17 ?? src.ages_0_17 ?? 0,
    children_0_5: src.children_0_5 ?? src.children_under5 ?? 0,
    children_6_11: src.children_6_11 ?? 0,
    children_12_17: src.children_12_17 ?? 0,
    youth_18_24: src.youth_18_24 ?? raw.youth_18_24 ?? 0,
    adults_18_59: src.adults_18_59 ?? src.ages_18_above ?? 0,
    elderly_60_plus: src.elderly_60_plus ?? 0,
    female_headed_hh: src.female_headed_hh ?? src.female_headed_hhs ?? 0,
    children_males_0_17: src.children_males_0_17 ?? 0,
    children_females_0_17: src.children_females_0_17 ?? 0,
  };
}

function sanitizeCivilRegistration(raw: any = {}): CivilRegistrationData {
  const src = raw.civil_registration || raw.civil_registration_v2 || raw;
  const no_bc =
    src.children_without_birth_certificate ??
    src.children_no_bc ??
    src.children_without_bc ??
    0;
  const no_nin = src.children_without_nin ?? src.children_no_nin ?? 0;
  const no_both =
    src.children_without_bc_and_nin ??
    src.children_no_bc_and_nin ??
    src.children_without_both ??
    0;
  const with_both =
    src.children_with_bc_and_nin ??
    src.children_with_both ??
    src.total_with_both ??
    0;

  return {
    children_without_birth_certificate: no_bc,
    children_no_bc: no_bc,
    children_without_nin: no_nin,
    children_no_nin: no_nin,
    children_without_bc_and_nin: no_both,
    children_no_bc_and_nin: no_both,
    children_with_bc_and_nin: with_both,
    children_with_both: with_both,
    no_bc_under_1: src.no_bc_under_1 ?? 0,
    no_bc_1_to_4: src.no_bc_1_to_4 ?? 0,
    no_bc_5_to_9: src.no_bc_5_to_9 ?? 0,
    no_bc_10_to_17: src.no_bc_10_to_17 ?? 0,
    no_nin_under_1: src.no_nin_under_1 ?? 0,
    no_nin_1_to_4: src.no_nin_1_to_4 ?? 0,
    no_nin_5_to_9: src.no_nin_5_to_9 ?? 0,
    no_nin_10_to_17: src.no_nin_10_to_17 ?? 0,
    no_bc_male_children: src.no_bc_male_children ?? src.no_bc_boys ?? 0,
    no_bc_female_children: src.no_bc_female_children ?? src.no_bc_girls ?? 0,
    no_nin_male_children: src.no_nin_male_children ?? src.no_nin_boys ?? 0,
    no_nin_female_children: src.no_nin_female_children ?? src.no_nin_girls ?? 0,
    adults_no_nin: src.adults_no_nin ?? src.adults_without_nin ?? 0,
    adults_no_bc: src.adults_no_bc ?? src.adults_without_bc ?? 0,
    adults_no_both: src.adults_no_both ?? src.adults_without_both ?? 0,
  };
}

function sanitizeEducation(raw: any = {}): EducationData {
  const src = raw.education || raw.education_v2 || raw;
  const oos_tot =
    src.oos_children_6_17 ?? src.oosc_total ?? src.total_oos_6_17 ?? 0;
  const oos_m = src.oos_male_6_17 ?? src.oosc_male ?? src.total_oos_boys ?? 0;
  const oos_f =
    src.oos_female_6_17 ?? src.oosc_female ?? src.total_oos_girls ?? 0;
  const never_m = src.never_enrolled_male ?? src.never_enrolled_boys ?? 0;
  const never_f = src.never_enrolled_female ?? src.never_enrolled_girls ?? 0;
  const never_tot = src.never_enrolled_6_17 ?? never_m + never_f;
  const drop_m = src.dropped_out_male ?? src.dropouts_boys ?? 0;
  const drop_f = src.dropped_out_female ?? src.dropouts_girls ?? 0;
  const drop_tot = src.dropped_out_6_17 ?? drop_m + drop_f;

  return {
    oos_children_6_17: oos_tot,
    oosc_total: oos_tot,
    oos_male_6_17: oos_m,
    oosc_male: oos_m,
    oos_female_6_17: oos_f,
    oosc_female: oos_f,
    never_enrolled_6_17: never_tot,
    never_enrolled_male: never_m,
    never_enrolled_female: never_f,
    dropped_out_6_17: drop_tot,
    dropped_out_male: drop_m,
    dropped_out_female: drop_f,
    oos_6_11: src.oos_6_11 ?? 0,
    oos_12_14: src.oos_12_14 ?? 0,
    oos_15_17: src.oos_15_17 ?? 0,
    never_enrolled_6_11: src.never_enrolled_6_11 ?? 0,
    never_enrolled_12_14: src.never_enrolled_12_14 ?? 0,
    never_enrolled_15_17: src.never_enrolled_15_17 ?? 0,
    dropped_out_6_11: src.dropped_out_6_11 ?? 0,
    dropped_out_12_14: src.dropped_out_12_14 ?? 0,
    dropped_out_15_17: src.dropped_out_15_17 ?? 0,
    girls_oos_6_11: src.girls_oos_6_11 ?? 0,
    girls_oos_12_14: src.girls_oos_12_14 ?? 0,
    girls_oos_15_17: src.girls_oos_15_17 ?? 0,
  };
}

function sanitizeHealthNutrition(raw: any = {}): HealthNutritionData {
  const src = raw.health_nutrition || raw.health_v2 || raw;
  const sam = src.sam_children ?? src.muac_severe_red ?? 0;
  const mam = src.mam_children ?? src.muac_moderate_yellow ?? 0;
  const normal = src.normal_children ?? src.muac_normal_green ?? 0;
  const calculatedScreened = sam + mam + normal;

  return {
    pregnant_women:
      src.pregnant_women ?? src.pregnant_total ?? raw.pregnant_women ?? 0,
    lactating_mothers:
      src.lactating_mothers ??
      src.lactating_total ??
      raw.lactating_mothers ??
      0,
    children_muac_screened: src.children_muac_screened ?? calculatedScreened,
    muac_normal_green: normal,
    muac_moderate_yellow: mam,
    muac_severe_red: sam,
    hh_with_health_insurance:
      src.hh_with_health_insurance ?? src.insurance_covered_households ?? 0,
    hh_with_nutrition_access:
      src.hh_with_nutrition_access ?? src.nutrition_service_access ?? 0,
    illness_under_5: src.illness_under_5 ?? 0,
    illness_5_to_17: src.illness_5_to_17 ?? 0,
    illness_18_to_59: src.illness_18_to_59 ?? 0,
    illness_60_plus: src.illness_60_plus ?? 0,
    illness_males: src.illness_males ?? 0,
    illness_females: src.illness_females ?? 0,
    food_support_received: src.food_support_received ?? 0,
    food_support_needed: src.food_support_needed ?? 0,
  };
}

function sanitizeDisabilities(raw: any = {}): DisabilitiesData {
  const src = raw.disabilities || raw.disabilities_v2 || raw;
  const total =
    src.total_plwd ?? src.plwd_total ?? src.pwd_total ?? raw.plwd ?? 0;
  const children = src.children_plwd ?? src.pwd_children ?? 0;
  const adults =
    src.adults_plwd ??
    src.pwd_adults ??
    (total > children ? total - children : 0);
  const boys = src.boys_plwd ?? src.children_plwd_boys ?? 0;
  const girls = src.girls_plwd ?? src.children_plwd_girls ?? 0;

  return {
    total_plwd: total,
    pwd_total: total,
    children_plwd: children,
    pwd_children: children,
    adults_plwd: adults,
    pwd_adults: adults,
    boys_plwd: boys,
    girls_plwd: girls,
    men_plwd: src.men_plwd ?? 0,
    women_plwd: src.women_plwd ?? 0,
    visual_impairment: src.visual_impairment ?? 0,
    hearing_impairment: src.hearing_impairment ?? 0,
    physical_impairment: src.physical_impairment ?? 0,
    intellectual_impairment: src.intellectual_impairment ?? 0,
    multiple_impairments: src.multiple_impairments ?? 0,
    children_visual: src.children_visual ?? 0,
    children_hearing: src.children_hearing ?? 0,
    children_physical: src.children_physical ?? 0,
    children_intellectual: src.children_intellectual ?? 0,
  };
}

function sanitizeLivelihoods(raw: any = {}): LivelihoodsShocksData {
  const src = raw.livelihoods_shocks || raw.livelihoods || raw;
  return {
    crop_farming: src.crop_farming ?? 0,
    livestock_rearing: src.livestock_rearing ?? 0,
    informal_commerce: src.informal_commerce ?? 0,
    wage_labor: src.wage_labor ?? 0,
    formal_employment: src.formal_employment ?? 0,
    artisanal_crafts: src.artisanal_crafts ?? 0,
    youth_18_24_employed: src.youth_18_24_employed ?? src.youth_employed ?? 0,
    youth_18_24_unemployed:
      src.youth_18_24_unemployed ?? src.youth_unemployed ?? 0,
    youth_18_24_in_education: src.youth_18_24_in_education ?? 0,
    shock_flood: src.shock_flood ?? 0,
    shock_drought: src.shock_drought ?? 0,
    shock_conflict: src.shock_conflict ?? 0,
    shock_food_price_hike: src.shock_food_price_hike ?? 0,
    shock_illness_death: src.shock_illness_death ?? 0,
    coping_sold_assets: src.coping_sold_assets ?? 0,
    coping_reduced_meals: src.coping_reduced_meals ?? 0,
    coping_borrowed_money: src.coping_borrowed_money ?? 0,
    coping_withdrew_children_school: src.coping_withdrew_children_school ?? 0,
    coping_child_labor: src.coping_child_labor ?? 0,
  };
}

function sanitizeGeoRecord(raw: any, level: GeoRecord["level"]): GeoRecord {
  return {
    id:
      raw.id ||
      `${level}-${raw.state || ""}-${raw.lga || ""}-${raw.ward || ""}-${raw.community || ""}`,
    name:
      raw.name ||
      raw.community ||
      raw.ward ||
      raw.lga ||
      raw.state ||
      "Unknown",
    level,
    state: raw.state,
    lga: raw.lga,
    ward: raw.ward,
    community: raw.community,
    demographics: sanitizeDemographics(raw),
    civil_registration: sanitizeCivilRegistration(raw),
    education: sanitizeEducation(raw),
    health_nutrition: sanitizeHealthNutrition(raw),
    disabilities: sanitizeDisabilities(raw),
    livelihoods_shocks: sanitizeLivelihoods(raw),
    unicef_indicators: raw.unicef_indicators || raw.indicators || {},
  };
}

export async function loadSummaryData(): Promise<DashboardData> {
  const [natRes, stateRes, lgaRes, wardRes, commRes] = await Promise.all([
    fetch(`${DATA_BASE_URL}/national_summary.json`),
    fetch(`${DATA_BASE_URL}/states_summary.json`),
    fetch(`${DATA_BASE_URL}/lga_summary.json`),
    fetch(`${DATA_BASE_URL}/ward_summary.json`),
    fetch(`${DATA_BASE_URL}/community_summary.json`),
  ]);

  if (!natRes.ok || !stateRes.ok || !lgaRes.ok) {
    throw new Error("Failed to load primary aggregation files.");
  }

  const [natData, stateData, lgaData, wardData, commData] = await Promise.all([
    natRes.json(),
    stateRes.json(),
    lgaRes.json(),
    wardRes.ok ? wardRes.json() : [],
    commRes.ok ? commRes.json() : [],
  ]);

  const national: GeoRecord = sanitizeGeoRecord(natData, "national");
  const states: GeoRecord[] = (
    Array.isArray(stateData) ? stateData : Object.values(stateData)
  ).map((item: any) => sanitizeGeoRecord(item, "state"));
  const lgas: GeoRecord[] = (
    Array.isArray(lgaData) ? lgaData : Object.values(lgaData)
  ).map((item: any) => sanitizeGeoRecord(item, "lga"));
  const wards: GeoRecord[] = (
    Array.isArray(wardData) ? wardData : Object.values(wardData)
  ).map((item: any) => sanitizeGeoRecord(item, "ward"));
  const communities: GeoRecord[] = (
    Array.isArray(commData) ? commData : Object.values(commData)
  ).map((item: any) => sanitizeGeoRecord(item, "community"));

  const metadata: DataMetadata = {
    total_households: national.demographics.total_hh,
    total_individuals: national.demographics.total_individuals,
    states_count: states.length || 4,
    lgas_count: lgas.length,
    wards_count: wards.length,
    communities_count: communities.length,
    last_updated: natData.last_updated || new Date().toISOString(),
  };

  return {
    metadata,
    national,
    states,
    lgas,
    wards,
    communities,
  };
}

export const loadAllData = loadSummaryData;
export default loadSummaryData;
