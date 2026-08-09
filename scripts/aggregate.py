"""
NASSCO MDP Dashboard — Aggregation Pipeline
============================================

Transforms the raw UNICEF SUSI CSV (~130MB, 138k individual records across 41k
households in 4 pilot states) into 7 small JSON files consumed by the React app.

Version history:
  v2.0 — initial 7-file pipeline
  v2.1 — MUAC bug fix (numeric codes 1/2/3 -> Green/Yellow/Red)
  v3.0 — added extended{} block for 5-domain dashboard
  v3.1 — renamed female_headed_hh -> female_primary_respondent
  v3.2 — fixed Head-of-household selection (filter Head then dedup)
  v3.3 — beefed metadata (mdp_states, states, data_modes, aliases)
  v3.4 — UNICEF-aligned additions (age_bands_unicef, children_in_pvhh, etc.)
  v3.5 — this file. DECILE SILENT BUG FIX:

    The `decile` column in the CSV is stored as ORDINAL STRINGS
    ('1st', '2nd', '3rd', ..., '10th') — NOT numbers.

    Every version of the aggregator up to v3.4 did:
        pd.to_numeric(hh['decile'], errors='coerce')
    Which silently coerced every ordinal to NaN. Result:

        poorest_households = 0    (should be ~5,826)
        poorest_pct        = 0.0  (should be ~14.03%)
        decile_distribution = {d1: 0, d2: 0, ..., d10: 0}
        vulnerability_index = 0
        children_in_pvhh   = 0 children (should be ~12,848)

    Every dashboard component that reads these fields (HeadlineKpis,
    StateComparisonRow, CommunityRankingPanel, DecileChart, InsightsSidebar,
    the map's vulnerability color scale) has been displaying zero or
    fabricated data for anything decile-related. Silent since v2.x.

    Fix: _norm_decile() converts '1st' -> 1, '2nd' -> 2, ... '10th' -> 10
    in load_and_clean(), storing back to the same `decile` column. Every
    downstream metric that already uses decile is automatically corrected —
    no changes needed anywhere else in this file.

    Class of bug: same as v2.1 MUAC fix (numeric codes stored as strings
    that silently coerce to NaN, producing 0 rather than a crash).

  Persistent design notes carried forward:
    - OUT-OF-SCHOOL: 29.18% (v2.1 said 31.80%; unreproducible from current CSV)
    - FEMALE PRIMARY RESPONDENT: not DHS 'female-headed HH'
    - MUAC: numeric codes 1/2/3 -> Green/Yellow/Red
    - HEAD DEDUP: filter Head first, then dedup on hhnsrrno
"""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
RAW_CSV = Path(r"C:\Users\fdasb\Downloads\UNICEF SUSI BATCH1_08072026_PMT\UNICEF_SUSI_Batch1.csv")
OUT_DIR = PROJECT_ROOT / "public" / "data"

MDP_PILOT_STATES = ["ABIA", "BENUE", "OYO", "SOKOTO"]
DATA_MODES = ["nsr", "update"]

UNICEF_INDICATORS_AVAILABLE = [
    "primary_attendance", "lower_sec_attendance", "upper_sec_attendance",
    "out_of_school", "under5_wasting",
]
UNICEF_INDICATORS_PENDING_SOURCE = [
    "improved_water", "improved_sanitation", "improved_shelter",
    "improved_cooking_fuel", "improved_lighting", "housing_density",
    "child_labour", "hazardous_work", "informal_employment",
    "shock_exposure", "food_insecurity", "coping_severity",
    "assistance_dependence",
    "under5_stunting", "under5_underweight", "iycf_practices",
    "full_immunization", "skilled_birth_attendant", "antenatal_visits",
    "postnatal_check", "modern_contraception", "vitamin_a",
    "deworming", "child_illness_treatment", "insecticide_net_use",
    "pre_primary_attendance", "learning_materials", "early_stimulation",
    "child_discipline", "violent_discipline", "child_marriage",
]


# ---------------------------------------------------------------------------
# Code maps
# ---------------------------------------------------------------------------

DISABILITY_CODE_MAP: Dict[str, str] = {
    "1": "Blind / vision impaired", "2": "Deaf / hearing impaired",
    "3": "Physical disability", "4": "Mental illness",
    "5": "Epilepsy", "6": "Speech impaired",
    "7": "Autism", "8": "Other",
}

CHRONIC_ILL_CODE_MAP: Dict[str, str] = {
    "1": "Cancer", "2": "Diabetes", "3": "Tuberculosis",
    "4": "HIV/AIDS", "5": "Heart disease", "6": "Hepatitis",
    "7": "Leprosy", "8": "Other chronic illness",
}

LIVELIHOOD_CODE_MAP: Dict[str, str] = {
    "1": "Dependant / not economically active",
    "2": "Livelihood type 2", "3": "Livelihood type 3",
    "4": "Livelihood type 4", "5": "Livelihood type 5",
    "6": "Livelihood type 6", "7": "Livelihood type 7",
    "8": "Livelihood type 8",
}

MARITAL_NORMALIZE: Dict[str, str] = {
    "seperated": "Separated", "dirvorced": "Divorced",
    "divorced": "Divorced", "separated": "Separated",
    "married": "Married", "never married": "Never Married",
    "widowed": "Widowed",
}

# Decile ordinal -> integer conversion (v3.5 bug fix).
# The CSV stores '1st'/'2nd'/'3rd'/'4th'/...'10th' as strings; any code
# doing pd.to_numeric(..., errors='coerce') silently returns NaN.
DECILE_ORDINAL_MAP: Dict[str, int] = {
    "1st":  1, "2nd":  2, "3rd":  3, "4th":  4, "5th":  5,
    "6th":  6, "7th":  7, "8th":  8, "9th":  9, "10th": 10,
}

# Legacy 7-band pyramid — preserved for existing dashboard viz
AGE_BANDS = [
    ("0-4", 0, 4), ("5-9", 5, 9), ("10-14", 10, 14),
    ("15-17", 15, 17), ("18-34", 18, 34), ("35-59", 35, 59),
    ("60+", 60, 200),
]

# UNICEF-standard 4-band grouping (per Indicator List for Review #4, #6)
AGE_BANDS_UNICEF = [
    ("0-5",   0,   5),
    ("6-14",  6,   14),
    ("15-17", 15,  17),
    ("18+",   18,  200),
]


# ---------------------------------------------------------------------------
# Defensive normalizers
# ---------------------------------------------------------------------------

def _norm_yes_no(val: Any) -> str:
    if val is None:
        return ""
    if isinstance(val, float) and np.isnan(val):
        return ""
    s = str(val).strip().lower()
    if s in ("yes", "y", "1", "1.0", "true", "t"):
        return "Yes"
    if s in ("no", "n", "0", "0.0", "false", "f"):
        return "No"
    return ""


def _norm_muac(val: Any) -> str:
    """
    v2.1 fix: values are numeric codes '1'/'2'/'3' (or floats), NOT text.
    Verified against Abia presentation pie chart (94.4/3.6/2.0).
    """
    if val is None:
        return ""
    if isinstance(val, float) and np.isnan(val):
        return ""
    s = str(val).strip()
    if s == "" or s.lower() == "nan":
        return ""
    if s in ("1", "1.0"): return "Green"
    if s in ("2", "2.0"): return "Yellow"
    if s in ("3", "3.0"): return "Red"
    return s.title()


def _norm_shock_type(val: Any) -> str:
    if val is None:
        return ""
    if isinstance(val, float) and np.isnan(val):
        return ""
    s = str(val).strip().lower()
    if s == "" or s == "nan":
        return ""
    mapping = {
        "conflict": "Conflict / insecurity", "flood": "Flood",
        "fire": "Fire", "storm": "Storm",
        "landslide": "Landslide", "other": "Other",
    }
    return mapping.get(s, s.title())


def _norm_marital(val: Any) -> str:
    if val is None:
        return ""
    if isinstance(val, float) and np.isnan(val):
        return ""
    s = str(val).strip().lower()
    if s == "" or s == "nan":
        return ""
    return MARITAL_NORMALIZE.get(s, str(val).strip().title())


def _norm_decile(val: Any) -> Optional[int]:
    """
    v3.5 bug fix. Convert decile ordinal strings ('1st', '2nd', ..., '10th')
    to integers (1, 2, ..., 10). Also handles values that might already be
    numeric (int/float) from any future data-source variant.

    Returns None (NaN) for blanks / unrecognised values so downstream
    filters like `df['decile'] <= 3` behave predictably.
    """
    if val is None:
        return None
    if isinstance(val, float) and np.isnan(val):
        return None
    s = str(val).strip().lower()
    if s == "" or s == "nan":
        return None
    if s in DECILE_ORDINAL_MAP:
        return DECILE_ORDINAL_MAP[s]
    # Fallback: already-numeric strings ("1", "3.0", etc.)
    try:
        n = int(float(s))
        if 1 <= n <= 10:
            return n
    except (ValueError, TypeError):
        pass
    return None


def _decode_multi_codes(val: Any, code_map: Dict[str, str]) -> List[str]:
    if val is None:
        return []
    if isinstance(val, float) and np.isnan(val):
        return []
    s = str(val).strip()
    if s == "" or s.lower() == "nan":
        return []
    parts = [p.strip() for p in re.split(r"[\s,;]+", s) if p.strip()]
    return [code_map[p] for p in parts if p in code_map]


def _age_band(age: Any) -> str:
    if age is None:
        return ""
    try:
        a = int(age)
    except (ValueError, TypeError):
        return ""
    if a < 0 or a > 120:
        return ""
    for label, lo, hi in AGE_BANDS:
        if lo <= a <= hi:
            return label
    return ""


# ---------------------------------------------------------------------------
# Load + clean
# ---------------------------------------------------------------------------

def load_and_clean() -> pd.DataFrame:
    print(f"Loading {RAW_CSV} ...")
    df = pd.read_csv(RAW_CSV, low_memory=False)
    print(f"  Loaded {len(df):,} rows x {len(df.columns)} cols")

    df["state"] = df["state"].astype(str).str.strip().str.upper()

    for col in ("lga", "ward", "community"):
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip()

    df["_yes_birthcert"]  = df.get("birthcertificate").map(_norm_yes_no) if "birthcertificate" in df.columns else ""
    df["_yes_validnin"]   = df.get("validnin").map(_norm_yes_no)         if "validnin"         in df.columns else ""
    df["_yes_disability"] = df.get("disability").map(_norm_yes_no)       if "disability"       in df.columns else ""
    df["_yes_chronic"]    = df.get("chronicallyill").map(_norm_yes_no)   if "chronicallyill"   in df.columns else ""
    df["_yes_pregnant"]   = df.get("pregnant").map(_norm_yes_no)         if "pregnant"         in df.columns else ""
    df["_yes_lactating"]  = df.get("lactating").map(_norm_yes_no)        if "lactating"        in df.columns else ""
    df["_yes_healthcare"] = df.get("benefitfromhealthcare").map(_norm_yes_no) if "benefitfromhealthcare" in df.columns else ""
    df["_yes_anyshocks"]  = df.get("anyshocks").map(_norm_yes_no)        if "anyshocks"        in df.columns else ""
    df["_yes_rutf"]       = df.get("rutf").map(_norm_yes_no)             if "rutf"             in df.columns else ""
    df["_yes_food"]       = df.get("food").map(_norm_yes_no)             if "food"             in df.columns else ""
    df["_yes_cash"]       = df.get("cash").map(_norm_yes_no)             if "cash"             in df.columns else ""
    df["_yes_dontknow"]   = df.get("dontknow").map(_norm_yes_no)         if "dontknow"         in df.columns else ""

    df["_muac_cat"]        = df.get("muac_category").map(_norm_muac)    if "muac_category" in df.columns else ""
    df["_shock_type_norm"] = df.get("shock_type").map(_norm_shock_type) if "shock_type"    in df.columns else ""
    df["_marital_norm"]    = df.get("maritalstatus").map(_norm_marital) if "maritalstatus" in df.columns else ""
    df["_age_band"]        = df.get("agey").map(_age_band)              if "agey"          in df.columns else ""

    # v3.5 DECILE FIX — convert ordinal strings to integers in-place so every
    # downstream metric that uses `decile` (vulnerability_block, extended's
    # children_in_pvhh, community-level ranking) gets correct values.
    if "decile" in df.columns:
        original_col_type = df["decile"].dtype
        df["decile"] = df["decile"].map(_norm_decile)
        populated = df["decile"].notna().sum()
        total = len(df)
        pct_populated = 100 * populated / total if total else 0.0
        print(f"  decile normalised ({original_col_type} -> Int): "
              f"{populated:,} / {total:,} rows populated ({pct_populated:.1f}%)")
        # Warn if coverage looks wrong (should be ~100% based on the raw CSV)
        if pct_populated < 90:
            print("  ⚠️  WARNING: decile coverage under 90% — data format may have changed.")

    return df


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _hh_dedupe(df: pd.DataFrame) -> pd.DataFrame:
    if "hhnsrrno" in df.columns:
        return df.drop_duplicates(subset=["hhnsrrno"], keep="first")
    return df


def _heads_hh(df: pd.DataFrame) -> pd.DataFrame:
    if "hhnsrrno" not in df.columns or "relationship" not in df.columns:
        return df.iloc[0:0]
    heads = df[df["relationship"] == "Head"]
    return heads.drop_duplicates(subset=["hhnsrrno"], keep="first")


def _dist(series: pd.Series, top_n: Optional[int] = None) -> List[Dict[str, Any]]:
    s = series.dropna()
    s = s[s.astype(str).str.strip() != ""]
    total = len(s)
    if total == 0:
        return []
    vc = s.value_counts()
    if top_n:
        vc = vc.head(top_n)
    return [
        {"label": str(k), "count": int(v), "pct": round(100 * v / total, 2)}
        for k, v in vc.items()
    ]


def _rate(numerator_mask: pd.Series, denominator_mask: pd.Series) -> Dict[str, Any]:
    d = int(denominator_mask.sum())
    n = int((numerator_mask & denominator_mask).sum())
    return {
        "n": n, "d": d,
        "pct": round(100 * n / d, 2) if d else 0.0,
    }


# ---------------------------------------------------------------------------
# NSR / Update / Vulnerability / UNICEF blocks
# ---------------------------------------------------------------------------

def nsr_block(df: pd.DataFrame) -> Dict[str, Any]:
    hh = _hh_dedupe(df)
    total_hh = len(hh)
    total_ind = len(df)
    n_fem = int((df.get("sex") == "Female").sum())
    n_male = int((df.get("sex") == "Male").sum())
    u5 = int((df.get("agey") < 5).sum()) if "agey" in df.columns else 0
    u18 = int((df.get("agey") < 18).sum()) if "agey" in df.columns else 0
    elderly = int((df.get("agey") >= 60).sum()) if "agey" in df.columns else 0
    pwd = int((df["_yes_disability"] == "Yes").sum())
    orphans = int((df.get("orphan") == "Yes").sum()) if "orphan" in df.columns else 0

    nin_verified = int((df["_yes_validnin"] == "Yes").sum())
    nin_eligible = int(((df.get("agey") >= 16) & df["_yes_validnin"].isin(["Yes", "No"])).sum()) if "agey" in df.columns else 0
    nin_total = total_ind

    urban_hh = int((hh.get("urbanrural") == "Urban").sum()) if "urbanrural" in hh.columns else 0
    rural_hh = int((hh.get("urbanrural") == "Rural").sum()) if "urbanrural" in hh.columns else 0

    return {
        "total_households": total_hh,
        "total_individuals": total_ind,
        "total_female": n_fem, "total_male": n_male,
        "children_under5": u5, "children_under18": u18,
        "elderly": elderly, "pwd": pwd, "orphans": orphans,
        "avg_household_size": round(total_ind / total_hh, 1) if total_hh else 0.0,
        "gender_parity": round(100 * n_fem / (n_fem + n_male), 2) if (n_fem + n_male) else 0.0,
        "nin_verified": nin_verified,
        "nin_eligible_adults": nin_eligible,
        "nin_total_members": nin_total,
        "nin_verification_rate": round(100 * nin_verified / nin_eligible, 2) if nin_eligible else 0.0,
        "nin_coverage_all": round(100 * nin_verified / nin_total, 2) if nin_total else 0.0,
        "urban_households": urban_hh, "rural_households": rural_hh,
        "urban_pct": round(100 * urban_hh / total_hh, 2) if total_hh else 0.0,
    }


def update_block(_df: pd.DataFrame) -> Dict[str, Any]:
    return {
        "update_visits": 0, "updated_hh": 0, "new_entrants": 0,
        "exits": 0, "update_rate": 0.0, "net_change": 0,
    }


def vulnerability_block(df: pd.DataFrame) -> Dict[str, Any]:
    hh = _hh_dedupe(df)
    pmt = pd.to_numeric(hh.get("pmt"), errors="coerce").dropna() if "pmt" in hh.columns else pd.Series(dtype=float)
    # v3.5: decile is now already Int after load_and_clean. pd.to_numeric is
    # still safe here (int -> Int), just uses the already-correct values.
    decile = pd.to_numeric(hh.get("decile"), errors="coerce").dropna() if "decile" in hh.columns else pd.Series(dtype=float)

    dec_counts = {f"d{i}": int((decile == i).sum()) for i in range(1, 11)}
    poorest = int((decile <= 3).sum())
    total_hh = len(hh)
    poorest_pct = round(100 * poorest / total_hh, 2) if total_hh else 0.0

    roof_improved = {"Cement/Concrete", "Corrugated Iron Sheet", "Roofing Tiles"}
    floor_improved = {"Concrete", "Wood/Tile"}
    toilet_improved = {"Flush to Piped Sewer System", "Flush to Septic Tank", "VIP Laterine", "Pit Laterine with Slab"}
    water_improved = {"Piped water", "Borehole", "Protected Well", "Protected Spring", "Bottled water"}

    def _pct(series_name: str, ok: set) -> float:
        if series_name not in hh.columns:
            return 0.0
        s = hh[series_name].astype(str).str.strip()
        return round(100 * s.isin(ok).sum() / len(s), 2) if len(s) else 0.0

    return {
        "pmt_mean":   round(float(pmt.mean()), 2)   if len(pmt) else 0.0,
        "pmt_median": round(float(pmt.median()), 2) if len(pmt) else 0.0,
        "decile_distribution": dec_counts,
        "poorest_households": poorest,
        "poorest_pct": poorest_pct,
        "vulnerability_index": round(poorest_pct * 1.4, 2),
        "improved_roof_pct":   _pct("roof_dwelling",   roof_improved),
        "improved_floor_pct":  _pct("floor_dwelling",  floor_improved),
        "improved_toilet_pct": _pct("toilet_dwelling", toilet_improved),
        "improved_water_pct":  _pct("drink_dwelling",  water_improved),
    }


def unicef_block(df: pd.DataFrame) -> Dict[str, Any]:
    agey = pd.to_numeric(df.get("agey"), errors="coerce")

    def _attend_pct(lo: int, hi: int) -> tuple[float, int, int]:
        mask = (agey >= lo) & (agey <= hi)
        total = int(mask.sum())
        if total == 0:
            return 0.0, 0, 0
        attend = df.loc[mask, "currentlyenrolledinschl"].astype(str).str.strip().str.lower()
        answered = attend.isin(["yes", "no"])
        n_answered = int(answered.sum())
        n_yes = int((attend == "yes").sum())
        pct = round(100 * n_yes / n_answered, 2) if n_answered else 0.0
        return pct, total, n_answered

    prim_pct, n_611,  n_ans_611  = _attend_pct(6, 11)
    lsec_pct, n_1214, n_ans_1214 = _attend_pct(12, 14)
    usec_pct, n_1517, n_ans_1517 = _attend_pct(15, 17)

    school_age = (agey >= 6) & (agey <= 17)
    enrol = df.loc[school_age, "currentlyenrolledinschl"].astype(str).str.strip().str.lower()
    answered_mask = enrol.isin(["yes", "no"])
    n_answered_all = int(answered_mask.sum())
    n_no = int((enrol == "no").sum())
    oos_pct = round(100 * n_no / n_answered_all, 2) if n_answered_all else 0.0

    u5 = (agey < 5)
    u5_total = int(u5.sum())
    muac_u5 = df.loc[u5, "_muac_cat"]
    screened = int(muac_u5.isin(["Green", "Yellow", "Red"]).sum())
    n_yellow = int((muac_u5 == "Yellow").sum())
    n_red    = int((muac_u5 == "Red").sum())
    wasting = n_yellow + n_red
    wast_pct = round(100 * wasting  / screened, 2) if screened else 0.0
    sam_pct  = round(100 * n_red    / screened, 2) if screened else 0.0
    mam_pct  = round(100 * n_yellow / screened, 2) if screened else 0.0

    return {
        "primary_age_attendance_pct":     prim_pct,
        "lower_secondary_attendance_pct": lsec_pct,
        "upper_secondary_attendance_pct": usec_pct,
        "out_of_school_rate_pct":         oos_pct,
        "under5_wasting_pct":             wast_pct,
        "under5_sam_pct":                 sam_pct,
        "under5_mam_pct":                 mam_pct,
        "denominators": {
            "children_6_11":           n_611,
            "children_12_14":          n_1214,
            "children_15_17":          n_1517,
            "children_answered_6_11":  n_ans_611,
            "children_answered_12_14": n_ans_1214,
            "children_answered_15_17": n_ans_1517,
            "under5_total":            u5_total,
            "under5_screened":         screened,
        },
        "coverage": {
            "education_response_pct": round(100 * n_answered_all / max(int(school_age.sum()), 1), 2),
            "muac_screening_pct":     round(100 * screened / u5_total, 2) if u5_total else 0.0,
        },
    }


# ---------------------------------------------------------------------------
# Extended block
# ---------------------------------------------------------------------------

def extended_block(df: pd.DataFrame) -> Dict[str, Any]:
    agey = pd.to_numeric(df.get("agey"), errors="coerce")
    hh = _hh_dedupe(df)

    # 1. 7-band age pyramid (existing — preserved)
    pyramid = []
    for label, lo, hi in AGE_BANDS:
        mask = (agey >= lo) & (agey <= hi)
        m = int((mask & (df["sex"] == "Male")).sum())
        f = int((mask & (df["sex"] == "Female")).sum())
        pyramid.append({"band": label, "male": m, "female": f, "total": m + f})

    # 2. Marital status
    adult = agey >= 15
    marital_dist = _dist(df.loc[adult, "_marital_norm"])

    # 3. Female primary respondent
    heads_hh = _heads_hh(df)
    total_heads = len(heads_hh)
    female_heads = int((heads_hh.get("sex") == "Female").sum())
    female_primary_respondent = {
        "n": female_heads, "d": total_heads,
        "pct": round(100 * female_heads / total_heads, 2) if total_heads else 0.0,
        "note": "This survey's 'Head' captures the primary respondent, not the DHS head-of-household definition. DHS Nigeria reports ~19% female-headed. State variation Sokoto 28% -> Oyo 59% reflects survey methodology.",
    }

    # 4. Birth certificate
    bcert_series = df["_yes_birthcert"]
    def _bcert(mask):
        answered = mask & bcert_series.isin(["Yes", "No"])
        d = int(answered.sum())
        n = int(((bcert_series == "Yes") & answered).sum())
        return {"n": n, "d": d, "pct": round(100 * n / d, 2) if d else 0.0}
    birthcert_0_5 = _bcert(agey < 5)
    birthcert_6_17 = _bcert((agey >= 6) & (agey <= 17))
    birthcert_all_children = _bcert(agey < 18)

    # 5. Individual NIN
    nin_series = df["_yes_validnin"]
    def _nin(mask):
        answered = mask & nin_series.isin(["Yes", "No"])
        d = int(answered.sum())
        n = int(((nin_series == "Yes") & answered).sum())
        return {"n": n, "d": d, "pct": round(100 * n / d, 2) if d else 0.0}
    nin_children = _nin(agey < 18)
    nin_adults = _nin(agey >= 18)
    nin_all = _nin(pd.Series([True] * len(df), index=df.index))

    # 6. Disability
    dis_rate = _rate(df["_yes_disability"] == "Yes",
                     df["_yes_disability"].isin(["Yes", "No"]))
    disability_yes_rows = df[df["_yes_disability"] == "Yes"]
    if "typeofdisability" in disability_yes_rows.columns and len(disability_yes_rows):
        decoded = disability_yes_rows["typeofdisability"].apply(
            lambda v: _decode_multi_codes(v, DISABILITY_CODE_MAP)
        )
        exploded = decoded.explode().dropna()
        disability_types = _dist(exploded)
    else:
        disability_types = []

    # 7. Chronic illness
    chron_rate = _rate(df["_yes_chronic"] == "Yes",
                       df["_yes_chronic"].isin(["Yes", "No"]))
    chron_yes_rows = df[df["_yes_chronic"] == "Yes"]
    if "chronicallyilltype" in chron_yes_rows.columns and len(chron_yes_rows):
        decoded = chron_yes_rows["chronicallyilltype"].apply(
            lambda v: _decode_multi_codes(v, CHRONIC_ILL_CODE_MAP)
        )
        exploded = decoded.explode().dropna()
        chronic_types = _dist(exploded)
    else:
        chronic_types = []

    # 8. Housing
    housing = {
        "roof":   _dist(hh.get("roof_dwelling",  pd.Series(dtype=str))),
        "floor":  _dist(hh.get("floor_dwelling", pd.Series(dtype=str))),
        "toilet": _dist(hh.get("toilet_dwelling", pd.Series(dtype=str))),
        "water":  _dist(hh.get("drink_dwelling", pd.Series(dtype=str))),
        "light":  _dist(hh.get("light_dwelling", pd.Series(dtype=str))),
        "cook":   _dist(hh.get("cook_dwelling",  pd.Series(dtype=str))),
    }

    # 9. Healthcare access
    hc_rate = _rate(df["_yes_healthcare"] == "Yes",
                    df["_yes_healthcare"].isin(["Yes", "No"]))
    hc_distance = _dist(df.get("howfarishealthcentre", pd.Series(dtype=str)))
    healthcare_access = {
        "benefits_pct": hc_rate,
        "distance_dist": hc_distance,
        "distance_coverage_pct": round(
            100 * (df.get("howfarishealthcentre").notna()).sum() / len(df), 2
        ) if "howfarishealthcentre" in df.columns else 0.0,
    }

    # 10. Livelihoods
    livelihoods = {
        "labour_status": _dist(df.get("b5labour", pd.Series(dtype=str))),
        "industry":      _dist(df.get("b6labour", pd.Series(dtype=str))),
        "code_dist":     [],
    }
    if "livelihoods" in df.columns:
        vc = df["livelihoods"].dropna().astype(int).astype(str).value_counts()
        total = int(vc.sum())
        livelihoods["code_dist"] = [
            {
                "code": code,
                "label": LIVELIHOOD_CODE_MAP.get(code, f"Code {code}"),
                "count": int(cnt),
                "pct": round(100 * cnt / total, 2) if total else 0.0,
            }
            for code, cnt in vc.items()
        ]

    # 11. Shocks
    hh_shock = _hh_dedupe(df)
    shock_rate = _rate(hh_shock["_yes_anyshocks"] == "Yes",
                       hh_shock["_yes_anyshocks"].isin(["Yes", "No"]))
    shock_types = _dist(hh_shock.loc[hh_shock["_yes_anyshocks"] == "Yes", "_shock_type_norm"])
    shock_years = _dist(hh_shock.loc[hh_shock["_yes_anyshocks"] == "Yes", "shock_year"]) \
                  if "shock_year" in hh_shock.columns else []
    shocks = {
        "exposure_pct": shock_rate,
        "types": shock_types,
        "years": shock_years,
    }

    # 12. Coping
    shock_hhs = hh_shock[hh_shock["_yes_anyshocks"] == "Yes"]
    if "mechanism_type" in shock_hhs.columns and len(shock_hhs):
        coping_dist = _dist(shock_hhs["mechanism_type"])
        coping_coverage = round(
            100 * shock_hhs["mechanism_type"].notna().sum() / len(shock_hhs), 2
        )
    else:
        coping_dist = []
        coping_coverage = 0.0
    coping = {
        "mechanisms": coping_dist,
        "coverage_pct": coping_coverage,
        "shock_exposed_hh": len(shock_hhs),
    }

    # 13. Assistance awareness
    asked_mask = df["_yes_rutf"].isin(["Yes", "No"])
    n_asked = int(asked_mask.sum())
    assistance_awareness = {
        "asked_n": n_asked,
        "rutf_yes_pct":     round(100 * ((df["_yes_rutf"]     == "Yes") & asked_mask).sum() / n_asked, 2) if n_asked else 0.0,
        "food_yes_pct":     round(100 * ((df["_yes_food"]     == "Yes") & asked_mask).sum() / n_asked, 2) if n_asked else 0.0,
        "cash_yes_pct":     round(100 * ((df["_yes_cash"]     == "Yes") & asked_mask).sum() / n_asked, 2) if n_asked else 0.0,
        "dontknow_yes_pct": round(100 * ((df["_yes_dontknow"] == "Yes") & asked_mask).sum() / n_asked, 2) if n_asked else 0.0,
    }

    # 14. Pregnant + lactating
    women_repro = (df.get("sex") == "Female") & (agey >= 15) & (agey <= 49)
    d = int(women_repro.sum())
    n_preg = int(((df["_yes_pregnant"] == "Yes") & women_repro).sum())
    n_lact = int(((df["_yes_lactating"] == "Yes") & women_repro).sum())
    plw = {
        "women_repro_age": d,
        "pregnant":  {"n": n_preg, "d": d, "pct": round(100 * n_preg / d, 2) if d else 0.0},
        "lactating": {"n": n_lact, "d": d, "pct": round(100 * n_lact / d, 2) if d else 0.0},
    }

    # 15. MUAC distribution
    u5_mask = agey < 5
    u5_df = df[u5_mask]
    muac_raw = pd.to_numeric(u5_df.get("muac"), errors="coerce").dropna() \
               if "muac" in u5_df.columns else pd.Series(dtype=float)
    hist_bins = [0, 8, 10, 11.5, 12.5, 13.5, 15, 20, 25]
    hist_labels = ["<8", "8-10", "10-11.5", "11.5-12.5 (SAM)", "12.5-13.5 (MAM)",
                   "13.5-15", "15-20", "20+"]
    if len(muac_raw):
        counts, _ = np.histogram(muac_raw, bins=hist_bins)
        muac_hist = [{"bin": lbl, "count": int(c)} for lbl, c in zip(hist_labels, counts)]
    else:
        muac_hist = [{"bin": lbl, "count": 0} for lbl in hist_labels]

    muac_cat_counts = {
        "Green":  int((u5_df["_muac_cat"] == "Green").sum()),
        "Yellow": int((u5_df["_muac_cat"] == "Yellow").sum()),
        "Red":    int((u5_df["_muac_cat"] == "Red").sum()),
    }
    muac_distribution = {
        "histogram": muac_hist,
        "categories": muac_cat_counts,
        "measured_n": int(len(muac_raw)),
    }

    # 16. Age bands per UNICEF (0-5, 6-14, 15-17, 18+) x sex
    age_bands_unicef: List[Dict[str, Any]] = []
    for label, lo, hi in AGE_BANDS_UNICEF:
        mask = (agey >= lo) & (agey <= hi)
        m = int((mask & (df["sex"] == "Male")).sum())
        f = int((mask & (df["sex"] == "Female")).sum())
        age_bands_unicef.append({
            "band": label, "male": m, "female": f, "total": m + f,
        })

    # 17. Children in PVHH (v3.5: decile is now properly numeric).
    # Because decile is populated on EVERY row (not just head), the direct
    # row-level filter now works correctly and gives the same answer as the
    # HH-set approach. Sanity-checked against diag_pvhh output: 12,848 children.
    if "decile" in df.columns and "hhnsrrno" in df.columns:
        decile_num = pd.to_numeric(df["decile"], errors="coerce")
        pvhh_mask = decile_num <= 3
        child_in_pvhh_mask = (agey < 18) & pvhh_mask
        total_children = int((agey < 18).sum())
        n_pvhh_children = int(child_in_pvhh_mask.sum())
        pvhh_hhs = hh[pd.to_numeric(hh["decile"], errors="coerce") <= 3] if "decile" in hh.columns else hh.iloc[0:0]
        n_pvhh_hhs = len(pvhh_hhs)
    else:
        total_children = int((agey < 18).sum())
        n_pvhh_children = 0
        n_pvhh_hhs = 0

    children_in_pvhh = {
        "n": n_pvhh_children,
        "d": total_children,
        "pct": round(100 * n_pvhh_children / total_children, 2) if total_children else 0.0,
        "pvhh_household_count": n_pvhh_hhs,
        "note": "PVHH = poverty-vulnerable household (PMT decile 1-3). Count of children under 18 living in these households.",
    }

    # 18. Children in risk-prone HH (any shock experienced)
    if "hhnsrrno" in df.columns:
        shock_hhs_set = set(hh_shock.loc[hh_shock["_yes_anyshocks"] == "Yes", "hhnsrrno"])
        child_mask = agey < 18
        hh_in_shock = df["hhnsrrno"].isin(shock_hhs_set)
        n_risk_children = int((child_mask & hh_in_shock).sum())
        risk_hh_count = len(shock_hhs_set)
    else:
        n_risk_children = 0
        risk_hh_count = 0

    children_in_risk_hh = {
        "n": n_risk_children,
        "d": total_children,
        "pct": round(100 * n_risk_children / total_children, 2) if total_children else 0.0,
        "risk_household_count": risk_hh_count,
        "note": "Risk-prone HH = household reporting any shock (anyshocks=Yes). Count of children under 18 in these households.",
    }

    # 19. Out-of-school by UNICEF bands (6-14, 15-17)
    def _oos_band(lo: int, hi: int) -> Dict[str, Any]:
        m = (agey >= lo) & (agey <= hi)
        e = df.loc[m, "currentlyenrolledinschl"].astype(str).str.strip().str.lower()
        ans = e.isin(["yes", "no"])
        d = int(ans.sum())
        n = int((e == "no").sum())
        total = int(m.sum())
        return {
            "n": n, "d": d, "total_in_band": total,
            "pct": round(100 * n / d, 2) if d else 0.0,
        }

    oos_6_14 = _oos_band(6, 14)
    oos_15_17 = _oos_band(15, 17)
    combined_n = oos_6_14["n"] + oos_15_17["n"]
    combined_d = oos_6_14["d"] + oos_15_17["d"]
    combined_total = oos_6_14["total_in_band"] + oos_15_17["total_in_band"]
    oos_by_band = {
        "age_6_14":  oos_6_14,
        "age_15_17": oos_15_17,
        "combined_6_17": {
            "n": combined_n, "d": combined_d,
            "total_in_band": combined_total,
            "pct": round(100 * combined_n / combined_d, 2) if combined_d else 0.0,
        },
    }

    # 20. HHs with no health insurance (derived from benefitfromhealthcare)
    if "hhnsrrno" in df.columns and "_yes_healthcare" in df.columns:
        yes_by_hh = df.groupby("hhnsrrno")["_yes_healthcare"].apply(
            lambda s: "Yes" in set(s)
        )
        total_hh_here = len(yes_by_hh)
        n_no_insurance = int((~yes_by_hh).sum())
        no_health_insurance = {
            "n": n_no_insurance,
            "d": total_hh_here,
            "pct": round(100 * n_no_insurance / total_hh_here, 2) if total_hh_here else 0.0,
            "note": "HHs where no member reports benefiting from healthcare services. Proxy for 'no health insurance / no health access' per UNICEF #16.",
        }
    else:
        no_health_insurance = {"n": 0, "d": 0, "pct": 0.0, "note": ""}

    return {
        "age_sex_pyramid": pyramid,
        "marital_status": marital_dist,
        "female_primary_respondent": female_primary_respondent,
        "birth_cert": {
            "under_5": birthcert_0_5,
            "age_6_17": birthcert_6_17,
            "all_children": birthcert_all_children,
        },
        "individual_nin": {
            "children": nin_children,
            "adults": nin_adults,
            "all": nin_all,
        },
        "disability": {"rate": dis_rate, "types": disability_types},
        "chronic_illness": {"rate": chron_rate, "types": chronic_types},
        "housing": housing,
        "healthcare_access": healthcare_access,
        "livelihoods": livelihoods,
        "shocks": shocks,
        "coping": coping,
        "assistance_awareness": assistance_awareness,
        "plw": plw,
        "muac_distribution": muac_distribution,
        "age_bands_unicef":       age_bands_unicef,
        "children_in_pvhh":       children_in_pvhh,
        "children_in_risk_hh":    children_in_risk_hh,
        "oos_by_band":            oos_by_band,
        "no_health_insurance":    no_health_insurance,
    }


# ---------------------------------------------------------------------------
# Level assembler
# ---------------------------------------------------------------------------

def assemble_level(df: pd.DataFrame, level: str, keys: Dict[str, str]) -> Dict[str, Any]:
    out: Dict[str, Any] = {
        "nsr":            nsr_block(df),
        "update":         update_block(df),
        "vulnerability": vulnerability_block(df),
        "unicef":         unicef_block(df),
        "extended":       extended_block(df),
        "level":          level,
    }
    out.update(keys)
    return out


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    df = load_and_clean()

    print("\nBuilding national summary ...")
    national = assemble_level(df, "national", {})
    (OUT_DIR / "national_summary.json").write_text(json.dumps(national))

    print("Building state summaries ...")
    states = []
    encountered_states = []
    for state, sub in df.groupby("state"):
        if not state or state == "NAN":
            continue
        states.append(assemble_level(sub, "state", {"state": state}))
        encountered_states.append(state)
    (OUT_DIR / "states_summary.json").write_text(json.dumps(states))
    print(f"  {len(states)} states written")

    print("Building LGA summaries ...")
    lgas = []
    for (state, lga), sub in df.groupby(["state", "lga"]):
        if not lga or str(lga).lower() == "nan":
            continue
        lgas.append(assemble_level(sub, "lga", {"state": state, "lga": lga}))
    (OUT_DIR / "lga_summary.json").write_text(json.dumps(lgas))
    print(f"  {len(lgas)} LGAs written")

    print("Building ward summaries ...")
    wards = []
    for (state, lga, ward), sub in df.groupby(["state", "lga", "ward"]):
        if not ward or str(ward).lower() == "nan":
            continue
        wards.append(assemble_level(sub, "ward",
                                    {"state": state, "lga": lga, "ward": ward}))
    (OUT_DIR / "ward_summary.json").write_text(json.dumps(wards))
    print(f"  {len(wards)} wards written")

    print("Building community summaries ...")
    communities = []
    for (state, lga, ward, comm), sub in df.groupby(["state", "lga", "ward", "community"]):
        if not comm or str(comm).lower() == "nan":
            continue
        communities.append(assemble_level(sub, "community", {
            "state": state, "lga": lga, "ward": ward, "community": comm,
        }))
    (OUT_DIR / "community_summary.json").write_text(json.dumps(communities))
    print(f"  {len(communities)} communities written")

    print("Building timeseries ...")
    ts_rows = []
    if "interviewdate" in df.columns:
        df["_month"] = pd.to_datetime(df["interviewdate"], errors="coerce").dt.strftime("%Y-%m")
        for (state, month), sub in df.groupby(["state", "_month"]):
            if pd.isna(month) or not month:
                continue
            sub_hh = _hh_dedupe(sub)
            ts_rows.append({
                "state": state,
                "month": month,
                "households": len(sub_hh),
                "individuals": len(sub),
                "nin_verified": int((sub["_yes_validnin"] == "Yes").sum()),
                "pmt_mean": round(float(pd.to_numeric(sub_hh.get("pmt"), errors="coerce").mean()), 2),
            })
    (OUT_DIR / "timeseries.json").write_text(json.dumps(ts_rows))
    print(f"  {len(ts_rows)} timeseries rows written")

    print("Building metadata ...")
    total_hh_count = len(_hh_dedupe(df))
    meta = {
        "generated_at":       datetime.now(timezone.utc).isoformat(),
        "source_csv":         str(RAW_CSV.name),
        "row_count":          len(df),
        "household_count":    total_hh_count,
        "state_count":        len(states),
        "lga_count":          len(lgas),
        "ward_count":         len(wards),
        "community_count":    len(communities),
        "aggregator_version": "3.5",

        "source_file":     str(RAW_CSV.name),
        "source_rows":     len(df),
        "total_households": total_hh_count,
        "total_members":   len(df),

        "states":     sorted(encountered_states),
        "mdp_states": MDP_PILOT_STATES,
        "data_modes": DATA_MODES,

        "unicef_indicators_available":       UNICEF_INDICATORS_AVAILABLE,
        "unicef_indicators_pending_source":  UNICEF_INDICATORS_PENDING_SOURCE,

        "code_maps": {
            "disability":  DISABILITY_CODE_MAP,
            "chronic_ill": CHRONIC_ILL_CODE_MAP,
            "livelihood":  LIVELIHOOD_CODE_MAP,
            "decile":      {k: v for k, v in DECILE_ORDINAL_MAP.items()},
        },

        "notes": {
            "out_of_school":              "v3.1+ reports 29.18%. v2.1's 31.80% could not be reproduced from the current CSV.",
            "female_primary_respondent":  "Renamed from 'female_headed_hh'. Captures who answered the enumerator, NOT DHS-comparable head-of-household. National ~50.7% (Sokoto 28% -> Oyo 59%).",
            "hh_dedup":                   "v3.2 fixed Head-selection. All non-Head aggregations remain correct: HH-level fields verified identical across rows.",
            "livelihood_codes":           "Codes 2-8 are labelled provisionally as 'Livelihood type N' pending the questionnaire codebook.",
            "unicef_additions_v34":       "age_bands_unicef, children_in_pvhh (#5), children_in_risk_hh (#26), oos_by_band (#12, #25), no_health_insurance (#16) added per Indicator List for Review.",
            "decile_fix_v35":             "CSV stores decile as ordinal strings ('1st'..'10th'). v3.5 normalises them to integers 1-10 in load_and_clean(). Prior to v3.5, all decile-derived numbers (poorest_pct, decile_distribution, vulnerability_index, children_in_pvhh) were silently zero.",
        },
    }
    (OUT_DIR / "metadata.json").write_text(json.dumps(meta, indent=2))

    print("\n✅ Done. Wrote 7 files to public/data/")
    print(f"   v3.5 fixes the decile silent-zero bug — poverty numbers are now correct.")


if __name__ == "__main__":
    main()