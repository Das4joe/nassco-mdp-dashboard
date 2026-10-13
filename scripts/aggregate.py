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
    """Computes all UNICEF MDP metrics for a given subset of data."""
    total_records = len(sub_df)
    if total_records == 0:
        return {}

    total_households = (
        int(sub_df["hhno"].nunique())
        if "hhno" in sub_df.columns
        else total_records
    )

    # Top-level NSR Summary Object (Required by Frontend)
    nsr_data = {
        "total_households": total_households,
        "total_individuals": total_records,
        "children_0_17": int(sub_df["is_0_17"].sum()),
        "children_0_5": int(sub_df["is_0_5"].sum()),
        "youth_18_24": int(sub_df["is_18_24"].sum()),
        "plwd": int(sub_df["is_disabled"].sum()),
        "children_with_disabilities": int(
            (sub_df["is_0_17"] & sub_df["is_disabled"]).sum()
        ),
        "pregnant_women": int(
            (sub_df["is_female"] & sub_df["is_pregnant"]).sum()
        ),
        "lactating_mothers": int(
            (sub_df["is_female"] & sub_df["is_lactating"]).sum()
        ),
    }

    # 1. DEMOGRAPHICS & POPULATION PYRAMID (0-24)
    pyramid_bands = [
        ("0-4", 0, 4),
        ("5-9", 5, 9),
        ("10-14", 10, 14),
        ("15-19", 15, 19),
        ("20-24", 20, 24),
    ]

    pyramid_0_24 = []
    for label, min_a, max_a in pyramid_bands:
        band_mask = (sub_df["agey"] >= min_a) & (sub_df["agey"] <= max_a)
        boys = int((band_mask & sub_df["is_male"]).sum())
        girls = int((band_mask & sub_df["is_female"]).sum())
        pyramid_0_24.append(
            {"ageGroup": label, "boys": boys, "girls": girls, "total": boys + girls}
        )

    age_ratio = [
        {
            "ageGroup": label,
            "count": int(
                (
                    (sub_df["agey"] >= min_a) & (sub_df["agey"] <= max_a)
                ).sum()
            ),
        }
        for label, min_a, max_a in pyramid_bands
    ]

    total_boys_17 = int((sub_df["is_0_17"] & sub_df["is_male"]).sum())
    total_girls_17 = int((sub_df["is_0_17"] & sub_df["is_female"]).sum())

    # 2. CIVIL REGISTRATION CROSS-TABS
    c_0_17_with_bc = int((sub_df["is_0_17"] & sub_df["has_bc"]).sum())
    c_0_5_with_bc = int((sub_df["is_0_5"] & sub_df["has_bc"]).sum())
    c_0_17_no_bc = int((sub_df["is_0_17"] & sub_df["no_bc"]).sum())
    c_0_5_no_bc = int((sub_df["is_0_5"] & sub_df["no_bc"]).sum())

    c_0_17_with_nin = int((sub_df["is_0_17"] & sub_df["has_nin"]).sum())
    c_0_5_with_nin = int((sub_df["is_0_5"] & sub_df["has_nin"]).sum())
    c_0_17_no_nin = int((sub_df["is_0_17"] & sub_df["no_nin"]).sum())
    c_0_5_no_nin = int((sub_df["is_0_5"] & sub_df["no_nin"]).sum())

    c_0_17_no_bc_no_nin = int(
        (sub_df["is_0_17"] & sub_df["no_bc"] & sub_df["no_nin"]).sum()
    )
    c_0_5_no_bc_no_nin = int(
        (sub_df["is_0_5"] & sub_df["no_bc"] & sub_df["no_nin"]).sum()
    )
    c_0_17_bc_no_nin = int(
        (sub_df["is_0_17"] & sub_df["has_bc"] & sub_df["no_nin"]).sum()
    )
    c_0_5_bc_no_nin = int(
        (sub_df["is_0_5"] & sub_df["has_bc"] & sub_df["no_nin"]).sum()
    )
    c_0_17_nin_no_bc = int(
        (sub_df["is_0_17"] & sub_df["has_nin"] & sub_df["no_bc"]).sum()
    )
    c_0_5_nin_no_bc = int(
        (sub_df["is_0_5"] & sub_df["has_nin"] & sub_df["no_bc"]).sum()
    )

    bc_by_gender = {
        "boys_with_bc": int(
            (sub_df["is_0_17"] & sub_df["is_male"] & sub_df["has_bc"]).sum()
        ),
        "girls_with_bc": int(
            (sub_df["is_0_17"] & sub_df["is_female"] & sub_df["has_bc"]).sum()
        ),
        "boys_no_bc": int(
            (sub_df["is_0_17"] & sub_df["is_male"] & sub_df["no_bc"]).sum()
        ),
        "girls_no_bc": int(
            (sub_df["is_0_17"] & sub_df["is_female"] & sub_df["no_bc"]).sum()
        ),
    }

    nin_by_gender = {
        "boys_with_nin": int(
            (sub_df["is_0_17"] & sub_df["is_male"] & sub_df["has_nin"]).sum()
        ),
        "girls_with_nin": int(
            (sub_df["is_0_17"] & sub_df["is_female"] & sub_df["has_nin"]).sum()
        ),
        "boys_no_nin": int(
            (sub_df["is_0_17"] & sub_df["is_male"] & sub_df["no_nin"]).sum()
        ),
        "girls_no_nin": int(
            (sub_df["is_0_17"] & sub_df["is_female"] & sub_df["no_nin"]).sum()
        ),
    }

    # 3. EDUCATION / OUT OF SCHOOL
    out_6_9 = int((sub_df["is_6_9"] & sub_df["is_out_of_school"]).sum())
    out_10_14 = int((sub_df["is_10_14"] & sub_df["is_out_of_school"]).sum())
    out_15_17 = int((sub_df["is_15_17"] & sub_df["is_out_of_school"]).sum())
    disabled_never_enrolled = int(
        (
            sub_df["is_0_17"]
            & sub_df["is_disabled"]
            & sub_df["is_out_of_school"]
        ).sum()
    )

    out_6_9_boys = int(
        (
            sub_df["is_6_9"]
            & sub_df["is_male"]
            & sub_df["is_out_of_school"]
        ).sum()
    )
    out_6_9_girls = int(
        (
            sub_df["is_6_9"]
            & sub_df["is_female"]
            & sub_df["is_out_of_school"]
        ).sum()
    )
    out_10_14_boys = int(
        (
            sub_df["is_10_14"]
            & sub_df["is_male"]
            & sub_df["is_out_of_school"]
        ).sum()
    )
    out_10_14_girls = int(
        (
            sub_df["is_10_14"]
            & sub_df["is_female"]
            & sub_df["is_out_of_school"]
        ).sum()
    )
    out_15_17_boys = int(
        (
            sub_df["is_15_17"]
            & sub_df["is_male"]
            & sub_df["is_out_of_school"]
        ).sum()
    )
    out_15_17_girls = int(
        (
            sub_df["is_15_17"]
            & sub_df["is_female"]
            & sub_df["is_out_of_school"]
        ).sum()
    )

    not_attending_0_17_boys = int(
        (
            sub_df["is_0_17"]
            & sub_df["is_male"]
            & sub_df["is_out_of_school"]
        ).sum()
    )
    not_attending_0_17_girls = int(
        (
            sub_df["is_0_17"]
            & sub_df["is_female"]
            & sub_df["is_out_of_school"]
        ).sum()
    )

    # 4. HEALTH & NUTRITION
    sam_children = int((sub_df["muac_cat"] == 1.0).sum())
    mam_children = int((sub_df["muac_cat"] == 2.0).sum())
    normal_children = int((sub_df["muac_cat"] == 3.0).sum())

    # 5. LIVELIHOODS & SHOCKS
    female_headed_hhs = int(
        sub_df[sub_df["is_female_head"]]["hhno"].nunique()
    )
    shock_prone_hhs = int(sub_df[sub_df["has_shock"]]["hhno"].nunique())
    children_in_risk_hhs = int(
        (sub_df["is_0_17"] & sub_df["has_shock"]).sum()
    )

    youth_employed = int(
        (sub_df["is_18_24"] & (sub_df["b5labour_clean"] != "Unemployed")).sum()
    )
    youth_unemployed = int(
        (sub_df["is_18_24"] & (sub_df["b5labour_clean"] == "Unemployed")).sum()
    )

    return {
        "nsr": nsr_data,  # EXPLICITLY WRAPPED FOR FRONTEND
        "total_households": total_households,
        "total_individuals": total_records,
        "children_0_17": nsr_data["children_0_17"],
        "children_0_5": nsr_data["children_0_5"],
        "youth_18_24": nsr_data["youth_18_24"],
        "plwd": nsr_data["plwd"],
        "children_with_disabilities": nsr_data["children_with_disabilities"],
        "pregnant_women": nsr_data["pregnant_women"],
        "lactating_mothers": nsr_data["lactating_mothers"],
        "pyramid_0_24": pyramid_0_24,
        "gender_ratio": {"boys": total_boys_17, "girls": total_girls_17},
        "age_ratio": age_ratio,
        "civil_registration": {
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
            "bc_by_gender": bc_by_gender,
            "nin_by_gender": nin_by_gender,
        },
        "education": {
            "out_of_school_6_9": out_6_9,
            "out_of_school_10_14": out_10_14,
            "out_of_school_15_17": out_15_17,
            "disabled_never_enrolled_0_17": disabled_never_enrolled,
            "out_of_school_6_9_boys": out_6_9_boys,
            "out_of_school_6_9_girls": out_6_9_girls,
            "out_of_school_10_14_boys": out_10_14_boys,
            "out_of_school_10_14_girls": out_10_14_girls,
            "out_of_school_15_17_boys": out_15_17_boys,
            "out_of_school_15_17_girls": out_15_17_girls,
            "not_attending_0_17_boys": not_attending_0_17_boys,
            "not_attending_0_17_girls": not_attending_0_17_girls,
        },
        "health_nutrition": {
            "pregnant_women": nsr_data["pregnant_women"],
            "lactating_mothers": nsr_data["lactating_mothers"],
            "sam_children": sam_children,
            "mam_children": mam_children,
            "normal_children": normal_children,
            "health_insurance_0_7_covered": 0,
            "health_insurance_0_7_not_covered": int(
                (sub_df["agey"] <= 7).sum()
            ),
            "health_insurance_0_5_covered": 0,
            "health_insurance_0_5_not_covered": int(sub_df["is_0_5"].sum()),
        },
        "livelihoods": {
            "female_headed_hhs": female_headed_hhs,
            "youth_employed": youth_employed,
            "youth_unemployed": youth_unemployed,
            "shock_prone_hhs": shock_prone_hhs,
            "children_in_risk_hhs": children_in_risk_hhs,
        },
    }


def main():
    parser = argparse.ArgumentParser(
        description="Process NASSCO MDP Survey Data"
    )
    parser.add_argument(
        "--input", default=DEFAULT_INPUT, help="Path to input .dta or .csv file"
    )
    parser.add_argument(
        "--outdir", default=DEFAULT_OUTDIR, help="Path to output directory"
    )
    args = parser.parse_args()

    input_path = args.input
    outdir = args.outdir

    print("==================================================")
    print("🚀 Starting NASSCO Data Aggregation Engine")
    print(f"📂 Reading input file: {input_path}")
    print("==================================================")

    if not os.path.exists(input_path):
        print(f"❌ ERROR: File not found at {input_path}")
        sys.exit(1)

    if input_path.endswith(".dta"):
        print("⏳ Loading Stata (.dta) file... (takes ~15 seconds)")
        df = pd.read_stata(input_path)
    else:
        print("⏳ Loading CSV file...")
        df = pd.read_csv(input_path, low_memory=False)

    print(f"✅ Data loaded successfully! Total records: {len(df):,}")

    os.makedirs(outdir, exist_ok=True)

    print("⏳ Cleaning and pre-indexing survey variables...")

    df["agey"] = (
        pd.to_numeric(df["agey"], errors="coerce").fillna(0).astype(int)
    )

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

    df["state_clean"] = df["state"].apply(clean_geo_name)
    df["lga_clean"] = df["lga"].apply(clean_geo_name)
    df["ward_clean"] = df["ward"].apply(clean_geo_name)
    df["community_clean"] = df["community_name"].apply(clean_geo_name)

    print("⏳ Generating National Summary...")
    national_summary = compute_metrics(df)
    with open(os.path.join(outdir, "national_summary.json"), "w") as f:
        json.dump(national_summary, f, indent=2)

    print("⏳ Generating State Summaries...")
    states_list = []
    for state_name, group in df.groupby("state_clean"):
        s_data = compute_metrics(group)
        s_data["state"] = state_name
        states_list.append(s_data)

    with open(os.path.join(outdir, "states_summary.json"), "w") as f:
        json.dump(states_list, f, indent=2)

    print("⏳ Generating LGA Summaries...")
    lga_list = []
    for (state_name, lga_name), group in df.groupby(
        ["state_clean", "lga_clean"]
    ):
        l_data = compute_metrics(group)
        l_data["state"] = state_name
        l_data["lga"] = lga_name
        lga_list.append(l_data)

    with open(os.path.join(outdir, "lga_summary.json"), "w") as f:
        json.dump(lga_list, f, indent=2)

    print("⏳ Generating Ward Summaries...")
    ward_list = []
    for (state_name, lga_name, ward_name), group in df.groupby(
        ["state_clean", "lga_clean", "ward_clean"]
    ):
        w_data = compute_metrics(group)
        w_data["state"] = state_name
        w_data["lga"] = lga_name
        w_data["ward"] = ward_name
        ward_list.append(w_data)

    with open(os.path.join(outdir, "ward_summary.json"), "w") as f:
        json.dump(ward_list, f, indent=2)

    print("⏳ Generating Community Selection & Demographics Table...")
    community_list = []
    for (state_name, lga_name, ward_name, comm_name), group in df.groupby(
        ["state_clean", "lga_clean", "ward_clean", "community_clean"]
    ):
        c_data = compute_metrics(group)
        c_data["state"] = state_name
        c_data["lga"] = lga_name
        c_data["ward"] = ward_name
        c_data["community"] = comm_name

        c_data["pvhhs"] = int(group["hhno"].nunique())
        c_data["males"] = int(group["is_male"].sum())
        c_data["females"] = int(group["is_female"].sum())
        c_data["ages_0_17"] = int(group["is_0_17"].sum())
        c_data["ages_18_above"] = int((group["agey"] >= 18).sum())

        community_list.append(c_data)

    with open(os.path.join(outdir, "community_summary.json"), "w") as f:
        json.dump(community_list, f, indent=2)

    print("==================================================")
    print("✅ All JSON payloads written successfully to public/data/")
    print("🎉 Pipeline execution complete!")
    print("==================================================")


if __name__ == "__main__":
    main()