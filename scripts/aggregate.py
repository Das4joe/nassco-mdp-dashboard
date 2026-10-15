import os
import sys
import json
import argparse
import pandas as pd
import numpy as np

DEFAULT_INPUT = r"C:\Users\fdasb\Documents\MASTERs Program\Project folder\UNICEF SUSI BATCH1_08072026_PMT\NASSCO Multi-Dimensional Poverty.dta"
DEFAULT_OUTDIR = r"public/data"


def clean_str_series(series):
    """Utility to safely standardize string columns (handling Stata Categoricals & NaNs)."""
    if series is None:
        return pd.Series(dtype=str)
    return series.astype(object).fillna("").astype(str).str.strip().str.title()


def clean_geo_name(val):
    """Cleans geo identifiers like '2022. BENUE' into clean uppercase 'BENUE'."""
    val = str(val).strip()
    if "." in val:
        val = val.split(".", 1)[1].strip()
    return val.upper()


def compute_metrics(sub_df):
    """Computes all UNICEF MDP metrics matching the exact nested structure expected by React."""
    total_records = len(sub_df)
    if total_records == 0:
        return {}

    # Unique Registered Household Identification (hhnsrrno)
    hh_col = "hhnsrrno" if "hhnsrrno" in sub_df.columns else "hhno"
    total_households = int(sub_df[hh_col].nunique())

    # 1. BASE COHORTS & GENDER COUNTS
    total_males = int(sub_df["is_male"].sum())
    total_females = int(sub_df["is_female"].sum())

    children_0_17 = int(sub_df["is_0_17"].sum())
    children_0_5 = int(sub_df["is_0_5"].sum())
    children_0_3 = int((sub_df["agey"] <= 3).sum())
    youth_18_24 = int(sub_df["is_18_24"].sum())

    plwd_total = int(sub_df["is_disabled"].sum())
    children_plwd = int((sub_df["is_0_17"] & sub_df["is_disabled"]).sum())
    pregnant_total = int((sub_df["is_female"] & sub_df["is_pregnant"]).sum())
    lactating_total = int((sub_df["is_female"] & sub_df["is_lactating"]).sum())

    # 2. POPULATION PYRAMID (0-24)
    pyramid_bands = [
        ("0-4", 0, 4),
        ("5-9", 5, 9),
        ("10-14", 10, 14),
        ("15-19", 15, 19),
        ("20-24", 20, 24),
    ]

    age_sex_pyramid = []
    pyramid_0_24 = []
    for label, min_a, max_a in pyramid_bands:
        band_mask = (sub_df["agey"] >= min_a) & (sub_df["agey"] <= max_a)
        boys = int((band_mask & sub_df["is_male"]).sum())
        girls = int((band_mask & sub_df["is_female"]).sum())
        item = {
            "band": label,
            "ageGroup": label,
            "male": boys,
            "female": girls,
            "boys": boys,
            "girls": girls,
            "total": boys + girls,
        }
        age_sex_pyramid.append(item)
        pyramid_0_24.append(item)

    age_bands_v2 = {
        "0-17": {
            "total": children_0_17,
            "male": int((sub_df["is_0_17"] & sub_df["is_male"]).sum()),
            "female": int((sub_df["is_0_17"] & sub_df["is_female"]).sum()),
        },
        "0-3": {
            "total": children_0_3,
            "male": int(((sub_df["agey"] <= 3) & sub_df["is_male"]).sum()),
            "female": int(((sub_df["agey"] <= 3) & sub_df["is_female"]).sum()),
        },
        "0-5": {
            "total": children_0_5,
            "male": int((sub_df["is_0_5"] & sub_df["is_male"]).sum()),
            "female": int((sub_df["is_0_5"] & sub_df["is_female"]).sum()),
        },
        "18-24": {
            "total": youth_18_24,
            "male": int((sub_df["is_18_24"] & sub_df["is_male"]).sum()),
            "female": int((sub_df["is_18_24"] & sub_df["is_female"]).sum()),
        },
    }

    # 3. EDUCATION_V2 (EXACT NESTED SCHEMA EXPECTED BY Education.tsx)
    oos_6_9_m = int((sub_df["is_6_9"] & sub_df["is_male"] & sub_df["is_out_of_school"]).sum())
    oos_6_9_f = int((sub_df["is_6_9"] & sub_df["is_female"] & sub_df["is_out_of_school"]).sum())
    oos_6_9_tot = oos_6_9_m + oos_6_9_f

    oos_10_14_m = int((sub_df["is_10_14"] & sub_df["is_male"] & sub_df["is_out_of_school"]).sum())
    oos_10_14_f = int((sub_df["is_10_14"] & sub_df["is_female"] & sub_df["is_out_of_school"]).sum())
    oos_10_14_tot = oos_10_14_m + oos_10_14_f

    oos_15_17_m = int((sub_df["is_15_17"] & sub_df["is_male"] & sub_df["is_out_of_school"]).sum())
    oos_15_17_f = int((sub_df["is_15_17"] & sub_df["is_female"] & sub_df["is_out_of_school"]).sum())
    oos_15_17_tot = oos_15_17_m + oos_15_17_f

    oos_6_17_m = oos_6_9_m + oos_10_14_m + oos_15_17_m
    oos_6_17_f = oos_6_9_f + oos_10_14_f + oos_15_17_f
    oos_6_17_tot = oos_6_17_m + oos_6_17_f

    disabled_oos = int((sub_df["is_0_17"] & sub_df["is_disabled"] & sub_df["is_out_of_school"]).sum())

    education_v2 = {
        "oos_6_17": {
            "oos": oos_6_17_tot,
            "male": {"oos": oos_6_17_m},
            "female": {"oos": oos_6_17_f},
        },
        "oos_6_9": {
            "oos": oos_6_9_tot,
            "male": {"oos": oos_6_9_m},
            "female": {"oos": oos_6_9_f},
        },
        "oos_10_14": {
            "oos": oos_10_14_tot,
            "male": {"oos": oos_10_14_m},
            "female": {"oos": oos_10_14_f},
        },
        "oos_15_17": {
            "oos": oos_15_17_tot,
            "male": {"oos": oos_15_17_m},
            "female": {"oos": oos_15_17_f},
        },
        "disabled_children": {
            "oos": disabled_oos
        },
    }

    # 4. CIVIL REGISTRATION
    c_0_17_with_bc = int((sub_df["is_0_17"] & sub_df["has_bc"]).sum())
    c_0_5_with_bc = int((sub_df["is_0_5"] & sub_df["has_bc"]).sum())
    c_0_17_no_bc = int((sub_df["is_0_17"] & sub_df["no_bc"]).sum())
    c_0_5_no_bc = int((sub_df["is_0_5"] & sub_df["no_bc"]).sum())

    c_0_17_with_nin = int((sub_df["is_0_17"] & sub_df["has_nin"]).sum())
    c_0_5_with_nin = int((sub_df["is_0_5"] & sub_df["has_nin"]).sum())
    c_0_17_no_nin = int((sub_df["is_0_17"] & sub_df["no_nin"]).sum())
    c_0_5_no_nin = int((sub_df["is_0_5"] & sub_df["no_nin"]).sum())

    c_0_17_no_bc_no_nin = int((sub_df["is_0_17"] & sub_df["no_bc"] & sub_df["no_nin"]).sum())
    c_0_5_no_bc_no_nin = int((sub_df["is_0_5"] & sub_df["no_bc"] & sub_df["no_nin"]).sum())
    c_0_17_bc_no_nin = int((sub_df["is_0_17"] & sub_df["has_bc"] & sub_df["no_nin"]).sum())
    c_0_5_bc_no_nin = int((sub_df["is_0_5"] & sub_df["has_bc"] & sub_df["no_nin"]).sum())
    c_0_17_nin_no_bc = int((sub_df["is_0_17"] & sub_df["has_nin"] & sub_df["no_bc"]).sum())
    c_0_5_nin_no_bc = int((sub_df["is_0_5"] & sub_df["has_nin"] & sub_df["no_bc"]).sum())

    civil_reg_dict = {
        "c_0_17_with_bc": c_0_17_with_bc,
        "c_0_5_with_bc": c_0_5_with_bc,
        "c_0_17_no_bc": c_0_17_no_bc,
        "c_0_5_no_bc": c_0_5_no_bc,
        "c_0_17_with_nin": c_0_17_with_nin,
        "c_0_5_with_nin": c_0_5_with_nin,
        "c_0_17_no_nin": c_0_17_no_nin,
        "c_0_5_no_nin": c_0_5_no_nin,
        "c_0_17_no_bc_no_nin": c_0_17_no_bc_no_nin,
        "c_0_5_no_bc_no_nin": c_0_5_no_bc_no_nin,
        "c_0_17_bc_no_nin": c_0_17_bc_no_nin,
        "c_0_5_bc_no_nin": c_0_5_bc_no_nin,
        "c_0_17_nin_no_bc": c_0_17_nin_no_bc,
        "c_0_5_nin_no_bc": c_0_5_nin_no_bc,
    }

    # --- NEW: Civil Registration by Gender (0-17) ---
    bc_by_gender = {
        "boys_with_bc": int((sub_df["is_0_17"] & sub_df["is_male"] & sub_df["has_bc"]).sum()),
        "boys_without_bc": int((sub_df["is_0_17"] & sub_df["is_male"] & sub_df["no_bc"]).sum()),
        "girls_with_bc": int((sub_df["is_0_17"] & sub_df["is_female"] & sub_df["has_bc"]).sum()),
        "girls_without_bc": int((sub_df["is_0_17"] & sub_df["is_female"] & sub_df["no_bc"]).sum()),
    }

    nin_by_gender = {
        "boys_with_nin": int((sub_df["is_0_17"] & sub_df["is_male"] & sub_df["has_nin"]).sum()),
        "boys_without_nin": int((sub_df["is_0_17"] & sub_df["is_male"] & sub_df["no_nin"]).sum()),
        "girls_with_nin": int((sub_df["is_0_17"] & sub_df["is_female"] & sub_df["has_nin"]).sum()),
        "girls_without_nin": int((sub_df["is_0_17"] & sub_df["is_female"] & sub_df["no_nin"]).sum()),
    }

    # 5. HEALTH & NUTRITION
    sam_children = int((sub_df["muac_cat"] == 1.0).sum())
    mam_children = int((sub_df["muac_cat"] == 2.0).sum())
    normal_children = int((sub_df["muac_cat"] == 3.0).sum())

    # --- FIX: Health Insurance from real data (benefitfromhealthcare) ---
    children_0_7 = int((sub_df["agey"] <= 7).sum())
    if "has_healthcare_benefit" in sub_df.columns:
        hi_0_7_covered = int(((sub_df["agey"] <= 7) & sub_df["has_healthcare_benefit"]).sum())
        hi_0_5_covered = int((sub_df["is_0_5"] & sub_df["has_healthcare_benefit"]).sum())
    else:
        hi_0_7_covered = 0
        hi_0_5_covered = 0

    health_v2 = {
        "pregnant_total": pregnant_total,
        "lactating_total": lactating_total,
        "plwd_total": plwd_total,
        "children_plwd": children_plwd,
        "health_insurance_0_7_covered": hi_0_7_covered,
        "health_insurance_0_7_not_covered": children_0_7 - hi_0_7_covered,
        "health_insurance_0_5_covered": hi_0_5_covered,
        "health_insurance_0_5_not_covered": children_0_5 - hi_0_5_covered,
    }

    nutrition_v2 = {
        "pregnant_total": pregnant_total,
        "lactating_total": lactating_total,
        "sam_children": sam_children,
        "mam_children": mam_children,
        "normal_children": normal_children,
    }

    # --- NEW: Nutrition Programme Enrolment (among SAM+MAM children) ---
    sam_mam_mask = (sub_df["muac_cat"] == 1.0) | (sub_df["muac_cat"] == 2.0)
    total_sam_mam = int(sam_mam_mask.sum())

    if "prog_rutf" in sub_df.columns:
        prog_rutf_yes = int((sam_mam_mask & sub_df["prog_rutf"]).sum())
        prog_food_yes = int((sam_mam_mask & sub_df["prog_food"]).sum())
        prog_cash_yes = int((sam_mam_mask & sub_df["prog_cash"]).sum())
        prog_any_enrolled = int((sam_mam_mask & (
            sub_df["prog_rutf"] | sub_df["prog_food"] | sub_df["prog_cash"]
        )).sum())
    else:
        prog_rutf_yes = 0
        prog_food_yes = 0
        prog_cash_yes = 0
        prog_any_enrolled = 0

    nutrition_programme = {
        "total_sam_mam": total_sam_mam,
        "enrolled": prog_any_enrolled,
        "not_enrolled": total_sam_mam - prog_any_enrolled,
        "rutf": prog_rutf_yes,
        "food": prog_food_yes,
        "cash": prog_cash_yes,
    }

    # 6. LIVELIHOODS
    female_headed_hhs = int(sub_df[sub_df["is_female_head"]][hh_col].nunique())
    shock_prone_hhs = int(sub_df[sub_df["has_shock"]][hh_col].nunique())
    children_in_risk_hhs = int((sub_df["is_0_17"] & sub_df["has_shock"]).sum())

    livelihoods_resilience_v2 = {
        "female_headed_hhs": female_headed_hhs,
        "youth_employed": int((sub_df["is_18_24"] & (sub_df["b5labour_clean"] != "Unemployed")).sum()),
        "youth_unemployed": int((sub_df["is_18_24"] & (sub_df["b5labour_clean"] == "Unemployed")).sum()),
        "shock_prone_hhs": shock_prone_hhs,
        "children_in_risk_hhs": children_in_risk_hhs,
    }

    # --- NEW: Household Cross-Tabs ---
    if "hh_is_female_headed" in sub_df.columns and "hh_has_shock" in sub_df.columns:
        female_headed_shock_hhs = int(
            sub_df[sub_df["hh_is_female_headed"] & sub_df["hh_has_shock"]][hh_col].nunique()
        )
    else:
        female_headed_shock_hhs = 0

    if "hh_has_disabled" in sub_df.columns and "hh_has_shock" in sub_df.columns:
        disability_shock_hhs = int(
            sub_df[sub_df["hh_has_disabled"] & sub_df["hh_has_shock"]][hh_col].nunique()
        )
    else:
        disability_shock_hhs = 0

    if "hh_vulnerable_count" in sub_df.columns:
        multi_vulnerable_hhs = int(
            sub_df[sub_df["hh_vulnerable_count"] >= 2][hh_col].nunique()
        )
    else:
        multi_vulnerable_hhs = 0

    hh_cross = {
        "female_headed_shock": female_headed_shock_hhs,
        "disability_shock": disability_shock_hhs,
        "multi_vulnerable": multi_vulnerable_hhs,
    }

    # --- NEW: Disability Types (children 0-17) ---
    disability_type_cols = [
        "blind", "deaf", "physicaldisability", "mentalill",
        "epilepsy", "dumb", "autism", "otherdisability"
    ]
    disability_types_children = {}
    for dtype in disability_type_cols:
        flag_col = f"is_{dtype}"
        if flag_col in sub_df.columns:
            disability_types_children[dtype] = int(
                (sub_df["is_0_17"] & sub_df[flag_col]).sum()
            )
        else:
            disability_types_children[dtype] = 0

    # --- NEW: Disabled Never Enrolled by Gender (ages 6-17) ---
    is_6_17 = (sub_df["agey"] >= 6) & (sub_df["agey"] <= 17)
    disabled_never_enrolled_by_gender = {
        "boys": int((is_6_17 & sub_df["is_male"] & sub_df["is_disabled"] & sub_df["is_out_of_school"]).sum()),
        "girls": int((is_6_17 & sub_df["is_female"] & sub_df["is_disabled"] & sub_df["is_out_of_school"]).sum()),
    }

    # Top-Level NSR Summary Object
    nsr_data = {
        "total_households": total_households,
        "total_individuals": total_records,
        "total_male": total_males,
        "total_female": total_females,
        "children_under18": children_0_17,
        "children_under5": children_0_5,
        "children_0_17": children_0_17,
        "children_0_5": children_0_5,
        "youth_18_24": youth_18_24,
        "pwd": plwd_total,
        "plwd": plwd_total,
        "children_plwd": children_plwd,
        "children_with_disabilities": children_plwd,
        "pregnant_total": pregnant_total,
        "pregnant_women": pregnant_total,
        "lactating_total": lactating_total,
        "lactating_mothers": lactating_total,
    }

    return {
        "nsr": nsr_data,
        "total_households": total_households,
        "total_individuals": total_records,
        "children_0_17": children_0_17,
        "children_0_5": children_0_5,
        "youth_18_24": youth_18_24,
        "plwd": plwd_total,
        "children_with_disabilities": children_plwd,
        "pregnant_women": pregnant_total,
        "lactating_mothers": lactating_total,
        "pyramid_0_24": pyramid_0_24,
        "gender_ratio": {"boys": age_bands_v2["0-17"]["male"], "girls": age_bands_v2["0-17"]["female"]},
        "civil_registration": civil_reg_dict,
        "education": education_v2,
        "health_nutrition": health_v2,
        "nutrition": nutrition_v2,
        "livelihoods": livelihoods_resilience_v2,

        # --- NEW: Additional top-level keys for UI ---
        "bc_by_gender": bc_by_gender,
        "nin_by_gender": nin_by_gender,
        "disability_types_children": disability_types_children,
        "disabled_never_enrolled_by_gender": disabled_never_enrolled_by_gender,
        "nutrition_programme": nutrition_programme,
        "hh_cross": hh_cross,

        # EXTENDED OBJECT (Eliminates `t.extended is undefined` errors on tabs)
        "extended": {
            "age_sex_pyramid": age_sex_pyramid,
            "age_bands_v2": age_bands_v2,
            "civil_registration": civil_reg_dict,
            "education_v2": education_v2,
            "health_v2": health_v2,
            "nutrition_v2": nutrition_v2,
            "livelihoods_resilience_v2": livelihoods_resilience_v2,
            # --- NEW: Mirror new keys into extended for consistency ---
            "bc_by_gender": bc_by_gender,
            "nin_by_gender": nin_by_gender,
            "disability_types_children": disability_types_children,
            "disabled_never_enrolled_by_gender": disabled_never_enrolled_by_gender,
            "nutrition_programme": nutrition_programme,
            "hh_cross": hh_cross,
        },
    }


def main():
    parser = argparse.ArgumentParser(description="Process NASSCO MDP Survey Data")
    parser.add_argument("--input", default=DEFAULT_INPUT, help="Path to input .dta or .csv file")
    parser.add_argument("--outdir", default=DEFAULT_OUTDIR, help="Path to output directory")
    args = parser.parse_args()

    input_path = args.input
    outdir = args.outdir

    print("==================================================")
    print("Starting NASSCO Data Aggregation Engine")
    print(f"Reading input file: {input_path}")
    print("==================================================")

    if not os.path.exists(input_path):
        print(f"ERROR: File not found at {input_path}")
        sys.exit(1)

    if input_path.endswith(".dta"):
        print("Loading Stata (.dta) file... (takes ~15 seconds)")
        df = pd.read_stata(input_path)
    else:
        print("Loading CSV file...")
        df = pd.read_csv(input_path, low_memory=False)

    print(f"Data loaded successfully! Total records: {len(df):,}")

    os.makedirs(outdir, exist_ok=True)

    print("Cleaning and pre-indexing survey variables...")

    df["agey"] = pd.to_numeric(df["agey"], errors="coerce").fillna(0).astype(int)

    clean_sex = clean_str_series(df["sex"])
    clean_bc = clean_str_series(df["birthcertificate"])
    clean_nin = clean_str_series(df["validnin"])
    clean_school = clean_str_series(df["currentlyenrolledinschl"])
    clean_preg = clean_str_series(df["pregnant"])
    clean_lact = clean_str_series(df["lactating"])
    clean_dis = clean_str_series(df["disability"])
    clean_rel = clean_str_series(df["relationship"])
    clean_shock = clean_str_series(df["anyshocks"])

    df["is_male"] = clean_sex == "Male"
    df["is_female"] = clean_sex == "Female"

    df["is_0_17"] = df["agey"] <= 17
    df["is_0_5"] = df["agey"] <= 5
    df["is_18_24"] = (df["agey"] >= 18) & (df["agey"] <= 24)
    df["is_6_9"] = (df["agey"] >= 6) & (df["agey"] <= 9)
    df["is_10_14"] = (df["agey"] >= 10) & (df["agey"] <= 14)
    df["is_15_17"] = (df["agey"] >= 15) & (df["agey"] <= 17)

    df["has_bc"] = clean_bc == "Yes"
    df["no_bc"] = clean_bc == "No"
    df["has_nin"] = clean_nin == "Yes"
    df["no_nin"] = clean_nin == "No"

    df["is_out_of_school"] = clean_school == "No"
    df["is_pregnant"] = clean_preg == "Yes"
    df["is_lactating"] = clean_lact == "Yes"
    df["is_disabled"] = clean_dis == "Yes"

    df["is_head"] = clean_rel == "Head"
    df["is_female_head"] = df["is_head"] & df["is_female"]

    df["has_shock"] = clean_shock == "Yes"
    df["b5labour_clean"] = clean_str_series(df["b5labour"])

    if "muac_category" in df.columns:
        df["muac_cat"] = pd.to_numeric(df["muac_category"], errors="coerce")
    else:
        df["muac_cat"] = np.nan

    # --- NEW: Clean additional columns ---

    # Disability type flags (Yes/No categoricals, nulls become False)
    disability_type_cols = [
        "blind", "deaf", "physicaldisability", "mentalill",
        "epilepsy", "dumb", "autism"
    ]
    for col in disability_type_cols:
        if col in df.columns:
            df[f"is_{col}"] = clean_str_series(df[col]) == "Yes"
        else:
            df[f"is_{col}"] = False

    # otherdisability is float64, not category
    if "otherdisability" in df.columns:
        df["is_otherdisability"] = pd.to_numeric(df["otherdisability"], errors="coerce").fillna(0) > 0
    else:
        df["is_otherdisability"] = False

    # Health insurance / healthcare benefit (replaces hardcoded zeros)
    if "benefitfromhealthcare" in df.columns:
        df["has_healthcare_benefit"] = clean_str_series(df["benefitfromhealthcare"]) == "Yes"
    else:
        df["has_healthcare_benefit"] = False

    # Nutrition programme flags (rutf, food, cash, dontknow)
    for col in ["rutf", "food", "cash", "dontknow"]:
        if col in df.columns:
            df[f"prog_{col}"] = clean_str_series(df[col]) == "Yes"
        else:
            df[f"prog_{col}"] = False

    # Chronically ill flag (for multi-vulnerable household definition)
    if "chronicallyill" in df.columns:
        df["is_chronically_ill"] = clean_str_series(df["chronicallyill"]) == "Yes"
    else:
        df["is_chronically_ill"] = False

    # --- NEW: Pre-compute household-level flags (once, on full dataframe) ---
    hh_col = "hhnsrrno" if "hhnsrrno" in df.columns else "hhno"

    print("Computing household-level flags...")
    df["hh_has_shock"] = df.groupby(hh_col)["has_shock"].transform("any")
    df["hh_has_disabled"] = df.groupby(hh_col)["is_disabled"].transform("any")
    df["hh_is_female_headed"] = df.groupby(hh_col)["is_female_head"].transform("any")

    # Vulnerable member count per household
    # Vulnerable = disabled OR chronically ill OR pregnant OR lactating OR under-5
    df["is_vulnerable_member"] = (
        df["is_disabled"] | df["is_chronically_ill"] |
        df["is_pregnant"] | df["is_lactating"] | df["is_0_5"]
    )
    df["hh_vulnerable_count"] = df.groupby(hh_col)["is_vulnerable_member"].transform("sum")

    # --- Geo cleaning ---
    df["state_clean"] = df["state"].apply(clean_geo_name)
    df["lga_clean"] = df["lga"].apply(clean_geo_name)
    df["ward_clean"] = df["ward"].apply(clean_geo_name)
    df["community_clean"] = df["community_name"].apply(clean_geo_name)

    print("Generating National Summary...")
    national_summary = compute_metrics(df)
    with open(os.path.join(outdir, "national_summary.json"), "w") as f:
        json.dump(national_summary, f, indent=2)

    print("Generating State Summaries...")
    states_list = []
    for state_name, group in df.groupby("state_clean"):
        s_data = compute_metrics(group)
        s_data["state"] = state_name
        states_list.append(s_data)

    with open(os.path.join(outdir, "states_summary.json"), "w") as f:
        json.dump(states_list, f, indent=2)

    print("Generating LGA Summaries...")
    lga_list = []
    for (state_name, lga_name), group in df.groupby(["state_clean", "lga_clean"]):
        l_data = compute_metrics(group)
        l_data["state"] = state_name
        l_data["lga"] = lga_name
        lga_list.append(l_data)

    with open(os.path.join(outdir, "lga_summary.json"), "w") as f:
        json.dump(lga_list, f, indent=2)

    print("Generating Ward Summaries...")
    ward_list = []
    for (state_name, lga_name, ward_name), group in df.groupby(["state_clean", "lga_clean", "ward_clean"]):
        w_data = compute_metrics(group)
        w_data["state"] = state_name
        w_data["lga"] = lga_name
        w_data["ward"] = ward_name
        ward_list.append(w_data)

    with open(os.path.join(outdir, "ward_summary.json"), "w") as f:
        json.dump(ward_list, f, indent=2)

    print("Generating Community Selection & Demographics Table...")
    community_list = []
    for (state_name, lga_name, ward_name, comm_name), group in df.groupby(["state_clean", "lga_clean", "ward_clean", "community_clean"]):
        c_data = compute_metrics(group)
        c_data["state"] = state_name
        c_data["lga"] = lga_name
        c_data["ward"] = ward_name
        c_data["community"] = comm_name

        c_data["pvhhs"] = int(group[hh_col].nunique())
        c_data["males"] = int(group["is_male"].sum())
        c_data["females"] = int(group["is_female"].sum())
        c_data["ages_0_17"] = int(group["is_0_17"].sum())
        c_data["ages_18_above"] = int((group["agey"] >= 18).sum())

        community_list.append(c_data)

    with open(os.path.join(outdir, "community_summary.json"), "w") as f:
        json.dump(community_list, f, indent=2)

    print("==================================================")
    print("All JSON payloads written successfully to public/data/")
    print("Pipeline execution complete!")
    print("==================================================")


if __name__ == "__main__":
    main()