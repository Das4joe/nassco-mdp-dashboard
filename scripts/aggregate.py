#!/usr/bin/env python3
"""
NASSCO MDP — UNICEF SUSI Batch1 Aggregation Script
====================================================
Input:  UNICEF_SUSI_Batch1.csv (130MB, 138,676 member rows)
Output: public/data/*.json (small aggregated files for React dashboard)

Usage:
    pip install pandas numpy
    python scripts/aggregate.py

Data structure:
    - One row = one household MEMBER (person)
    - hhnsrrno  = unique household ID
    - hhmnsrrno = unique member ID
    - Geography: state -> lga -> ward -> community_name
    - PMT score + decile already computed
"""

import pandas as pd
import numpy as np
import json
import os
from datetime import datetime
from pathlib import Path

# =============================================================================
# CONFIGURATION
# =============================================================================

CSV_INPUT   = r"C:\Users\fdasb\Downloads\UNICEF SUSI BATCH1_08072026_PMT\UNICEF_SUSI_Batch1.csv"
JSON_OUTPUT = r"C:\Users\fdasb\Desktop\nassco-mdp-dashboard\public\data"

# The 4 MDP pilot states (uppercase, as they appear in the CSV)
MDP_STATES = ["BENUE", "OYO", "SOKOTO", "ABIA"]

# Geography columns
GEO_STATE     = "state"
GEO_LGA       = "lga"
GEO_WARD      = "ward"
GEO_COMMUNITY = "community_name"

# Household + member identifiers
HH_ID     = "hhnsrrno"
MEMBER_ID = "hhmnsrrno"
HH_SIZE   = "hhsize"

# Member demographic columns
SEX          = "sex"
AGE_YEARS    = "agey"
RELATIONSHIP = "relationship"

# Vulnerability flags
DISABILITY      = "disability"
ORPHAN          = "orphan"
PREGNANT        = "pregnant"
LACTATING       = "lactating"
CHRONICALLY_ILL = "chronicallyill"

# NIN columns
VALID_NIN  = "validnin"
NIN_NUMBER = "ninnumber"

# PMT / poverty
PMT_SCORE = "pmt"
DECILE    = "decile"

# Interview date
INTERVIEW_DATE  = "interviewdate"
INTERVIEW_MONTH = "interviewmonth"
INTERVIEW_YEAR  = "interviewyear"

# Urban/rural
URBAN_RURAL = "urbanrural"
URBAN_FLAG  = "urban"

# Living conditions
ROOF     = "roof_dwelling"
FLOOR    = "floor_dwelling"
TOILET   = "toilet_dwelling"
WATER    = "drink_dwelling"
LIGHTING = "light_dwelling"
COOKING  = "cook_dwelling"

# =============================================================================
# HELPERS
# =============================================================================

def safe_int(val):
    try:
        v = int(val)
        return 0 if np.isnan(v) else v
    except Exception:
        return 0

def safe_float(val, dec=2):
    try:
        v = float(val)
        return round(0.0 if np.isnan(v) else v, dec)
    except Exception:
        return 0.0

def pct(num, den, dec=1):
    if den == 0:
        return 0.0
    return round((num / den) * 100, dec)

def write_json(data, filename):
    os.makedirs(JSON_OUTPUT, exist_ok=True)
    filepath = os.path.join(JSON_OUTPUT, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    size_kb = os.path.getsize(filepath) / 1024
    print(f"   OK  {filename:40s} {size_kb:8.1f} KB")
    return filepath

# =============================================================================
# STEP 1: LOAD CSV
# =============================================================================

def load_csv():
    print("=" * 60)
    print("NASSCO MDP - UNICEF SUSI Aggregation")
    print("=" * 60)
    print("\nLoading CSV...")
    print(f"   Path: {CSV_INPUT}")

    chunks = []
    chunk_iter = pd.read_csv(
        CSV_INPUT,
        encoding="utf-8",
        chunksize=10_000,
        low_memory=False,
        dtype=str
    )

    for i, chunk in enumerate(chunk_iter):
        chunks.append(chunk)
        print(f"   Loaded {(i+1)*10000:,} rows...", end="\r")

    df = pd.concat(chunks, ignore_index=True)
    print(f"\n   OK  {len(df):,} rows x {len(df.columns)} columns loaded")
    return df

# =============================================================================
# STEP 2: CLEAN & FILTER
# =============================================================================

def clean_and_filter(df):
    print("\nCleaning data...")

    # Normalize geography columns
    df[GEO_STATE]     = df[GEO_STATE].astype(str).str.strip().str.upper()
    df[GEO_LGA]       = df[GEO_LGA].astype(str).str.strip().str.title()
    df[GEO_WARD]      = df[GEO_WARD].astype(str).str.strip().str.title()
    df[GEO_COMMUNITY] = df[GEO_COMMUNITY].astype(str).str.strip().str.title()

    print(f"   States in raw data: {sorted(df[GEO_STATE].unique())}")

    # Filter to 4 MDP states
    before = len(df)
    df = df[df[GEO_STATE].isin(MDP_STATES)].copy()
    after = len(df)
    print(f"   Filtered to MDP states: {before:,} -> {after:,} rows")
    print(f"   States kept: {sorted(df[GEO_STATE].unique())}")

    # Convert straightforward numeric columns
    numeric_cols = [
        AGE_YEARS, HH_SIZE, PMT_SCORE,
        INTERVIEW_MONTH, INTERVIEW_YEAR,
        "geopointlatitude", "geopointlongitude"
    ]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # DECILE needs special handling: "8th", "5th", "1st" -> 8, 5, 1
    if DECILE in df.columns:
        df[DECILE] = (
            df[DECILE].astype(str)
            .str.strip()
            .str.lower()
            .str.replace(r"(st|nd|rd|th)$", "", regex=True)
        )
        df[DECILE] = pd.to_numeric(df[DECILE], errors="coerce")
        valid_deciles = sorted(df[DECILE].dropna().unique())
        print(f"   Decile values detected: {valid_deciles[:15]}")

    # Normalize boolean-ish columns (Yes/No -> 1/0)
    yes_no_cols = [
        DISABILITY, ORPHAN, PREGNANT, LACTATING,
        CHRONICALLY_ILL, VALID_NIN, "blind", "deaf",
        "physicaldisability", "mentalill"
    ]
    for col in yes_no_cols:
        if col in df.columns:
            df[col] = (
                df[col].astype(str).str.strip().str.lower()
                .map({"yes": 1, "1": 1, "true": 1,
                      "no": 0, "0": 0, "false": 0})
                .fillna(0).astype(int)
            )

    # Normalize sex
    if SEX in df.columns:
        df[SEX] = df[SEX].astype(str).str.strip().str.title()

    print(f"   OK  Cleaned. {len(df):,} rows remain.")
    return df

# =============================================================================
# STEP 3: BUILD HOUSEHOLD-LEVEL DATASET
# =============================================================================

def build_household_df(df):
    """
    Collapse member-level rows into one row per household.
    """
    print("\nBuilding household-level dataset...")

    # Household-level columns (same for every member of a household).
    # IMPORTANT: exclude HH_ID itself - it is the group key.
    hh_cols = [
        GEO_STATE, GEO_LGA, GEO_WARD, GEO_COMMUNITY,
        HH_SIZE, PMT_SCORE, DECILE, URBAN_RURAL, URBAN_FLAG,
        INTERVIEW_MONTH, INTERVIEW_YEAR,
        "geopointlatitude", "geopointlongitude",
        ROOF, FLOOR, TOILET, WATER, LIGHTING, COOKING
    ]
    hh_cols = [c for c in hh_cols if c in df.columns]

    hh_df = df.groupby(HH_ID, as_index=False)[hh_cols].first()
    print(f"   OK  {len(hh_df):,} unique households")

    agg_frames = {}

    # Total members per HH
    agg_frames["member_count"] = (
        df.groupby(HH_ID).size().reset_index(name="member_count")
    )

    # Sex counts
    if SEX in df.columns:
        agg_frames["female_count"] = (
            df[df[SEX] == "Female"].groupby(HH_ID).size()
            .reset_index(name="female_count")
        )
        agg_frames["male_count"] = (
            df[df[SEX] == "Male"].groupby(HH_ID).size()
            .reset_index(name="male_count")
        )

    # Age-based counts
    if AGE_YEARS in df.columns:
        age_num = pd.to_numeric(df[AGE_YEARS], errors="coerce")
        agg_frames["children_u5"] = (
            df[age_num < 5].groupby(HH_ID).size().reset_index(name="children_u5")
        )
        agg_frames["children_u18"] = (
            df[age_num < 18].groupby(HH_ID).size().reset_index(name="children_u18")
        )
        agg_frames["elderly_count"] = (
            df[age_num >= 60].groupby(HH_ID).size().reset_index(name="elderly_count")
        )

    # Vulnerability sums (already 1/0 after cleaning)
    vuln_pairs = [
        (DISABILITY,      "disabled_count"),
        (ORPHAN,          "orphan_count"),
        (VALID_NIN,       "nin_verified"),
        (PREGNANT,        "pregnant_count"),
        (LACTATING,       "lactating_count"),
        (CHRONICALLY_ILL, "chronically_ill_count"),
    ]
    for col_name, out_name in vuln_pairs:
        if col_name in df.columns:
            agg_frames[out_name] = (
                df.groupby(HH_ID)[col_name].sum()
                .reset_index(name=out_name)
            )

    # Merge all aggregates into hh_df
    for name, frame in agg_frames.items():
        if frame is not None:
            hh_df = hh_df.merge(frame, on=HH_ID, how="left")

    # Fill any missing count columns with 0
    count_cols = [
        "member_count", "female_count", "male_count",
        "children_u5", "children_u18", "elderly_count",
        "disabled_count", "orphan_count", "nin_verified",
        "pregnant_count", "lactating_count", "chronically_ill_count"
    ]
    for col in count_cols:
        if col in hh_df.columns:
            hh_df[col] = hh_df[col].fillna(0).astype(int)
        else:
            hh_df[col] = 0

    print(f"   OK  Household dataset built: {len(hh_df):,} rows x {len(hh_df.columns)} columns")
    return hh_df

# =============================================================================
# STEP 4: KPI AGGREGATION
# =============================================================================

def aggregate_group(hh_group, member_group):
    """
    Given a subset of the household df for a geography unit,
    produce the full KPI record.
    """
    total_hh     = len(hh_group)
    total_mem    = safe_int(hh_group["member_count"].sum())
    total_fem    = safe_int(hh_group["female_count"].sum())
    total_male   = safe_int(hh_group["male_count"].sum())
    children_u5  = safe_int(hh_group["children_u5"].sum())
    children_u18 = safe_int(hh_group["children_u18"].sum())
    elderly      = safe_int(hh_group["elderly_count"].sum())
    disabled     = safe_int(hh_group["disabled_count"].sum())
    orphans      = safe_int(hh_group["orphan_count"].sum())

    # NIN - computed against ADULTS (18+) only
    nin_verified  = safe_int(hh_group["nin_verified"].sum())
    adults_18plus = total_mem - children_u18
    nin_total     = adults_18plus if adults_18plus > 0 else total_mem

    # PMT
    pmt_vals = pd.to_numeric(hh_group[PMT_SCORE], errors="coerce").dropna()
    pmt_mean = safe_float(pmt_vals.mean())
    pmt_med  = safe_float(pmt_vals.median())

    # Decile distribution
    decile_vals = pd.to_numeric(hh_group[DECILE], errors="coerce").dropna()
    decile_dist = {}
    for d in range(1, 11):
        decile_dist[f"d{d}"] = safe_int((decile_vals == d).sum())

    poorest_hh = sum(decile_dist.get(f"d{d}", 0) for d in [1, 2, 3])

    # Urban/rural
    urban_hh = 0
    rural_hh = 0
    if URBAN_RURAL in hh_group.columns:
        urban_str = hh_group[URBAN_RURAL].astype(str).str.strip().str.lower()
        urban_hh  = safe_int((urban_str == "urban").sum())
        rural_hh  = safe_int((urban_str == "rural").sum())
    if urban_hh == 0 and rural_hh == 0 and URBAN_FLAG in hh_group.columns:
        urban_num = pd.to_numeric(hh_group[URBAN_FLAG], errors="coerce").fillna(0)
        urban_hh  = safe_int((urban_num == 1).sum())
        rural_hh  = safe_int((urban_num == 0).sum())

    # Dwelling conditions
    def pct_dwelling(col, good_values):
        if col not in hh_group.columns:
            return 0.0
        vals = hh_group[col].astype(str).str.strip()
        count = vals.isin(good_values).sum()
        return pct(count, total_hh)

    improved_roof   = pct_dwelling(ROOF,   ["Corrugated Iron Sheet", "Concrete/Cement", "Tiles"])
    improved_floor  = pct_dwelling(FLOOR,  ["Cement/Concrete", "Tiles", "Wood/Tile"])
    improved_toilet = pct_dwelling(TOILET, ["Flush to Sewage", "Flush to Somewhere else",
                                             "Pit Laterine with Slab", "Ventilated Improved Pit"])
    improved_water  = pct_dwelling(WATER,  ["Piped into Dwelling", "Piped into Yard/Plot",
                                             "Protected Dug Well", "Protected Spring",
                                             "Borehole/Tube Well"])

    # Vulnerability index (0-100)
    vuln_index = safe_float(
        (poorest_hh / total_hh * 40 if total_hh > 0 else 0) +
        (disabled / total_mem * 30 if total_mem > 0 else 0) +
        ((100 - improved_water) / 100 * 30)
    )

    return {
        "nsr": {
            "total_households":       total_hh,
            "total_individuals":      total_mem,
            "total_female":           total_fem,
            "total_male":             total_male,
            "children_under5":        children_u5,
            "children_under18":       children_u18,
            "elderly":                elderly,
            "pwd":                    disabled,
            "orphans":                orphans,
            "avg_household_size":     safe_float(total_mem / total_hh if total_hh > 0 else 0, 1),
            "gender_parity":          pct(total_fem, total_mem),
            "nin_verified":           nin_verified,
            "nin_eligible_adults":    adults_18plus,
            "nin_total_members":      total_mem,
            "nin_verification_rate":  pct(nin_verified, nin_total),
            "nin_coverage_all":       pct(nin_verified, total_mem),
            "urban_households":       urban_hh,
            "rural_households":       rural_hh,
            "urban_pct":              pct(urban_hh, total_hh),
        },
        "update": {
            "update_visits": 0,
            "updated_hh":    0,
            "new_entrants":  0,
            "exits":         0,
            "update_rate":   0.0,
            "net_change":    0,
        },
        "vulnerability": {
            "pmt_mean":            pmt_mean,
            "pmt_median":          pmt_med,
            "decile_distribution": decile_dist,
            "poorest_households":  poorest_hh,
            "poorest_pct":         pct(poorest_hh, total_hh),
            "vulnerability_index": vuln_index,
            "improved_roof_pct":   improved_roof,
            "improved_floor_pct":  improved_floor,
            "improved_toilet_pct": improved_toilet,
            "improved_water_pct":  improved_water,
        },
    }

# =============================================================================
# STEP 5: RUN AGGREGATIONS AT EACH GEOGRAPHY LEVEL
# =============================================================================

def run_all_aggregations(hh_df, raw_df):
    print("\nRunning aggregations...")

    # National
    print("   -> National total")
    national = aggregate_group(hh_df, raw_df)
    national["level"] = "national"
    write_json(national, "national_summary.json")

    # State
    print("   -> State level")
    states_out = []
    for state, grp in hh_df.groupby(GEO_STATE):
        rec = aggregate_group(grp, raw_df[raw_df[GEO_STATE] == state])
        rec["state"] = state
        rec["level"] = "state"
        states_out.append(rec)
    write_json(states_out, "states_summary.json")

    # LGA
    print("   -> LGA level")
    lgas_out = []
    for (state, lga), grp in hh_df.groupby([GEO_STATE, GEO_LGA]):
        rec = aggregate_group(grp, raw_df[
            (raw_df[GEO_STATE] == state) & (raw_df[GEO_LGA] == lga)
        ])
        rec["state"] = state
        rec["lga"]   = lga
        rec["level"] = "lga"
        lgas_out.append(rec)
    write_json(lgas_out, "lga_summary.json")

    # Ward
    print("   -> Ward level")
    wards_out = []
    for (state, lga, ward), grp in hh_df.groupby([GEO_STATE, GEO_LGA, GEO_WARD]):
        rec = aggregate_group(grp, raw_df[
            (raw_df[GEO_STATE] == state) &
            (raw_df[GEO_LGA]   == lga)   &
            (raw_df[GEO_WARD]  == ward)
        ])
        rec["state"] = state
        rec["lga"]   = lga
        rec["ward"]  = ward
        rec["level"] = "ward"
        wards_out.append(rec)
    write_json(wards_out, "ward_summary.json")

    # Community
    print("   -> Community level")
    comm_out = []
    for (state, lga, ward, comm), grp in hh_df.groupby(
        [GEO_STATE, GEO_LGA, GEO_WARD, GEO_COMMUNITY]
    ):
        rec = aggregate_group(grp, raw_df[
            (raw_df[GEO_STATE]     == state) &
            (raw_df[GEO_LGA]       == lga)   &
            (raw_df[GEO_WARD]      == ward)  &
            (raw_df[GEO_COMMUNITY] == comm)
        ])
        rec["state"]     = state
        rec["lga"]       = lga
        rec["ward"]      = ward
        rec["community"] = comm
        rec["level"]     = "community"
        comm_out.append(rec)
    write_json(comm_out, "community_summary.json")

    # Timeseries
    print("   -> Monthly timeseries")
    ts_out = []
    if INTERVIEW_MONTH in hh_df.columns and INTERVIEW_YEAR in hh_df.columns:
        year_str = (
            pd.to_numeric(hh_df[INTERVIEW_YEAR], errors="coerce")
            .astype("Int64").astype(str)
        )
        month_str = (
            pd.to_numeric(hh_df[INTERVIEW_MONTH], errors="coerce")
            .astype("Int64").astype(str).str.zfill(2)
        )
        hh_df["_ym"] = year_str + "-" + month_str

        for (state, ym), grp in hh_df.groupby([GEO_STATE, "_ym"]):
            ts_out.append({
                "state":        state,
                "month":        ym,
                "households":   len(grp),
                "individuals":  safe_int(grp["member_count"].sum()),
                "nin_verified": safe_int(grp["nin_verified"].sum()),
                "pmt_mean":     safe_float(
                    pd.to_numeric(grp[PMT_SCORE], errors="coerce").mean()
                ),
            })
        ts_out.sort(key=lambda x: (x["state"], x["month"]))
    write_json(ts_out, "timeseries.json")

    # Metadata
    print("   -> Metadata")
    meta = {
        "generated_at":     datetime.now().isoformat(),
        "source_file":      "UNICEF_SUSI_Batch1.csv",
        "source_rows":      138676,
        "total_households": len(hh_df),
        "total_members":    safe_int(hh_df["member_count"].sum()),
        "states":           sorted(hh_df[GEO_STATE].unique().tolist()),
        "lga_count":        int(hh_df[GEO_LGA].nunique()),
        "ward_count":       int(hh_df[GEO_WARD].nunique()),
        "community_count":  int(hh_df[GEO_COMMUNITY].nunique()),
        "mdp_states":       MDP_STATES,
        "data_modes":       ["nsr", "update"],
        "update_note":      "Update activity data not yet available in Batch1",
    }
    write_json(meta, "metadata.json")

    print("\n" + "=" * 60)
    print("ALL DONE")
    print("=" * 60)
    print(f"Output directory: {JSON_OUTPUT}")

# =============================================================================
# MAIN
# =============================================================================

if __name__ == "__main__":
    df    = load_csv()
    df    = clean_and_filter(df)
    hh_df = build_household_df(df)
    run_all_aggregations(hh_df, df)