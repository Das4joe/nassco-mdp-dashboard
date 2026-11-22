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

function sanitizeDemographics(raw: Partial<Demographics> = {}): Demographics {
  const total_ind = raw.total_individuals ?? raw.total_ind ?? 0;
  const total_hh = raw.total_hh ?? raw.households ?? 0;
  return {
    total_hh,
    households: total_hh,
    total_individuals: total_ind,
    total_ind,
    males: raw.males ?? 0,
    females: raw.females ?? 0,
    children_0_17: raw.children_0_17 ?? raw.children_0_17_total ?? 0,
    children_0_17_total: raw.children_0_17_total ?? raw.children_0_17 ?? 0,
    children_0_5: raw.children_0_5 ?? 0,
    children_6_11: raw.children_6_11 ?? 0,
    children_12_17: raw.children_12_17 ?? 0,
    youth_18_24: raw.youth_18_24 ?? 0,
    adults_18_59: raw.adults_18_59 ?? 0,
    elderly_60_plus: raw.elderly_60_plus ?? 0,
    female_headed_hh: raw.female_headed_hh ?? 0,
    children_males_0_17: raw.children_males_0_17 ?? 0,
    children_females_0_17: raw.children_females_0_17 ?? 0,
  };
}

function sanitizeCivilRegistration(
  raw: Partial<CivilRegistrationData> = {},
): CivilRegistrationData {
  return {
    children_without_birth_certificate:
      raw.children_without_birth_certificate ?? raw.children_no_bc ?? 0,
    children_no_bc:
      raw.children_no_bc ?? raw.children_without_birth_certificate ?? 0,
    children_without_nin: raw.children_without_nin ?? raw.children_no_nin ?? 0,
    children_no_nin: raw.children_no_nin ?? raw.children_without_nin ?? 0,
    children_without_bc_and_nin:
      raw.children_without_bc_and_nin ?? raw.children_no_bc_and_nin ?? 0,
    children_no_bc_and_nin:
      raw.children_no_bc_and_nin ?? raw.children_without_bc_and_nin ?? 0,
    children_with_bc_and_nin:
      raw.children_with_bc_and_nin ?? raw.children_with_both ?? 0,
    children_with_both:
      raw.children_with_both ?? raw.children_with_bc_and_nin ?? 0,
    no_bc_under_1: raw.no_bc_under_1 ?? 0,
    no_bc_1_to_4: raw.no_bc_1_to_4 ?? 0,
    no_bc_5_to_9: raw.no_bc_5_to_9 ?? 0,
    no_bc_10_to_17: raw.no_bc_10_to_17 ?? 0,
    no_nin_under_1: raw.no_nin_under_1 ?? 0,
    no_nin_1_to_4: raw.no_nin_1_to_4 ?? 0,
    no_nin_5_to_9: raw.no_nin_5_to_9 ?? 0,
    no_nin_10_to_17: raw.no_nin_10_to_17 ?? 0,
    no_bc_male_children: raw.no_bc_male_children ?? 0,
    no_bc_female_children: raw.no_bc_female_children ?? 0,
    no_nin_male_children: raw.no_nin_male_children ?? 0,
    no_nin_female_children: raw.no_nin_female_children ?? 0,
    adults_no_nin: raw.adults_no_nin ?? 0,
    adults_no_bc: raw.adults_no_bc ?? 0,
    adults_no_both: raw.adults_no_both ?? 0,
  };
}

function sanitizeEducation(raw: Partial<EducationData> = {}): EducationData {
  return {
    oos_children_6_17: raw.oos_children_6_17 ?? raw.oosc_total ?? 0,
    oosc_total: raw.oosc_total ?? raw.oos_children_6_17 ?? 0,
    oos_male_6_17: raw.oos_male_6_17 ?? raw.oosc_male ?? 0,
    oosc_male: raw.oosc_male ?? raw.oos_male_6_17 ?? 0,
    oos_female_6_17: raw.oos_female_6_17 ?? raw.oosc_female ?? 0,
    oosc_female: raw.oosc_female ?? raw.oos_female_6_17 ?? 0,
    never_enrolled_6_17: raw.never_enrolled_6_17 ?? 0,
    never_enrolled_male: raw.never_enrolled_male ?? 0,
    never_enrolled_female: raw.never_enrolled_female ?? 0,
    dropped_out_6_17: raw.dropped_out_6_17 ?? 0,
    dropped_out_male: raw.dropped_out_male ?? 0,
    dropped_out_female: raw.dropped_out_female ?? 0,
    oos_6_11: raw.oos_6_11 ?? 0,
    oos_12_14: raw.oos_12_14 ?? 0,
    oos_15_17: raw.oos_15_17 ?? 0,
    never_enrolled_6_11: raw.never_enrolled_6_11 ?? 0,
    never_enrolled_12_14: raw.never_enrolled_12_14 ?? 0,
    never_enrolled_15_17: raw.never_enrolled_15_17 ?? 0,
    dropped_out_6_11: raw.dropped_out_6_11 ?? 0,
    dropped_out_12_14: raw.dropped_out_12_14 ?? 0,
    dropped_out_15_17: raw.dropped_out_15_17 ?? 0,
    girls_oos_6_11: raw.girls_oos_6_11 ?? 0,
    girls_oos_12_14: raw.girls_oos_12_14 ?? 0,
    girls_oos_15_17: raw.girls_oos_15_17 ?? 0,
  };
}

function sanitizeHealthNutrition(
  raw: Partial<HealthNutritionData> = {},
): HealthNutritionData {
  return {
    pregnant_women: raw.pregnant_women ?? 0,
    lactating_mothers: raw.lactating_mothers ?? 0,
    children_muac_screened: raw.children_muac_screened ?? 0,
    muac_normal_green: raw.muac_normal_green ?? 0,
    muac_moderate_yellow: raw.muac_moderate_yellow ?? 0,
    muac_severe_red: raw.muac_severe_red ?? 0,
    hh_with_health_insurance: raw.hh_with_health_insurance ?? 0,
    hh_with_nutrition_access: raw.hh_with_nutrition_access ?? 0,
    illness_under_5: raw.illness_under_5 ?? 0,
    illness_5_to_17: raw.illness_5_to_17 ?? 0,
    illness_18_to_59: raw.illness_18_to_59 ?? 0,
    illness_60_plus: raw.illness_60_plus ?? 0,
    illness_males: raw.illness_males ?? 0,
    illness_females: raw.illness_females ?? 0,
    food_support_received: raw.food_support_received ?? 0,
    food_support_needed: raw.food_support_needed ?? 0,
  };
}

function sanitizeDisabilities(
  raw: Partial<DisabilitiesData> = {},
): DisabilitiesData {
  const total = raw.total_plwd ?? raw.pwd_total ?? 0;
  return {
    total_plwd: total,
    pwd_total: total,
    children_plwd: raw.children_plwd ?? raw.pwd_children ?? 0,
    pwd_children: raw.pwd_children ?? raw.children_plwd ?? 0,
    adults_plwd: raw.adults_plwd ?? raw.pwd_adults ?? 0,
    pwd_adults: raw.pwd_adults ?? raw.adults_plwd ?? 0,
    boys_plwd: raw.boys_plwd ?? 0,
    girls_plwd: raw.girls_plwd ?? 0,
    men_plwd: raw.men_plwd ?? 0,
    women_plwd: raw.women_plwd ?? 0,
    visual_impairment: raw.visual_impairment ?? 0,
    hearing_impairment: raw.hearing_impairment ?? 0,
    physical_impairment: raw.physical_impairment ?? 0,
    intellectual_impairment: raw.intellectual_impairment ?? 0,
    multiple_impairments: raw.multiple_impairments ?? 0,
    children_visual: raw.children_visual ?? 0,
    children_hearing: raw.children_hearing ?? 0,
    children_physical: raw.children_physical ?? 0,
    children_intellectual: raw.children_intellectual ?? 0,
  };
}

function sanitizeLivelihoods(
  raw: Partial<LivelihoodsShocksData> = {},
): LivelihoodsShocksData {
  return {
    crop_farming: raw.crop_farming ?? 0,
    livestock_rearing: raw.livestock_rearing ?? 0,
    informal_commerce: raw.informal_commerce ?? 0,
    wage_labor: raw.wage_labor ?? 0,
    formal_employment: raw.formal_employment ?? 0,
    artisanal_crafts: raw.artisanal_crafts ?? 0,
    youth_18_24_employed: raw.youth_18_24_employed ?? 0,
    youth_18_24_unemployed: raw.youth_18_24_unemployed ?? 0,
    youth_18_24_in_education: raw.youth_18_24_in_education ?? 0,
    shock_flood: raw.shock_flood ?? 0,
    shock_drought: raw.shock_drought ?? 0,
    shock_conflict: raw.shock_conflict ?? 0,
    shock_food_price_hike: raw.shock_food_price_hike ?? 0,
    shock_illness_death: raw.shock_illness_death ?? 0,
    coping_sold_assets: raw.coping_sold_assets ?? 0,
    coping_reduced_meals: raw.coping_reduced_meals ?? 0,
    coping_borrowed_money: raw.coping_borrowed_money ?? 0,
    coping_withdrew_children_school: raw.coping_withdrew_children_school ?? 0,
    coping_child_labor: raw.coping_child_labor ?? 0,
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
    demographics: sanitizeDemographics(raw.demographics || raw),
    civil_registration: sanitizeCivilRegistration(
      raw.civil_registration || raw,
    ),
    education: sanitizeEducation(raw.education || raw),
    health_nutrition: sanitizeHealthNutrition(raw.health_nutrition || raw),
    disabilities: sanitizeDisabilities(raw.disabilities || raw),
    livelihoods_shocks: sanitizeLivelihoods(raw.livelihoods_shocks || raw),
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
