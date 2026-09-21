"""
NASSCO MDP Dashboard — Aggregation Pipeline v4.0.1 (UNICEF Revamp)
==================================================================

Transforms raw UNICEF SUSI CSV (~130MB, 138k individual records across 41k
households in 4 pilot states) into JSON files consumed by the React app.

Version history:
  v2.0-v3.5: Legacy aggregations, decile silent bug fix, MUAC fix.
  v4.0: UNICEF Structural Revamp alignment:
    - Preserves all legacy top-level keys (nsr, update, vulnerability, unicef, extended) for backwards compatibility.
    - Expands `extended` and adds domain-level blocks matching the 6 UNICEF review sheets:
      1. Global / Overview (0-3, 0-5, 0-7, 0-17, 18-24, 18+ age bands x sex, large HHs, multi-vulnerable HHs, PVHH count).
      2. Civil Registration (0-17, 0-5, Adults 4-way cross-tab: both, cert_only, nin_only, neither x sex).
      3. Education / Out of School (6-9, 10-14, 15-17, 6-17 OOS x sex, grade completed, dropout period, PLWD attendance).
      4. Health (pregnant by age band, lactating, PLWD distribution x sex, honest insurance placeholder cards).
      5. Nutrition (SAM/MAM/Normal 6-59m x sex, honest F&N programme placeholder cards).
      6. Livelihoods & Shock Exposure (youth 18-24 employment/unemployment x sex, decoded shock types 1-8, coping mechanisms, children in risk HHs).
  v4.0.1: Merge + hardening pass:
    - Missing optional columns are created as empty instead of raising KeyError.
    - Enrolment normalised once (`_yes_enrolled`); OOS rates use the answered denominator (consistent with legacy).
    - Nutrition V2 uses true 6-59 month eligibility and text/numeric MUAC codes.
    - birth_cert.age_6_17 now computed for real (was a hard-coded 0.0 placeholder).
    - Youth block: non-responses no longer counted as employed; added sex split.
    - Shock type decoding handles multi-code / float-style values ("1.0", "1 4", "1,4").
    - coping.coverage_pct fixed (was categories / households).
    - Housing "improved" matching is now case-insensitive.
    - JSON writer converts numpy types and NaN/Inf -> null (valid JSON for the browser).
"""

from __future__ import annotations

import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd

# ---------------------------------------------------------------------------
# Paths & Candidates
# ---------------------------------------------------------------------------

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
DEFAULT_PATHS = [
    r"C:\Users\fdasb\Downloads\UNICEF SUSI BATCH1_08072026_PMT\UNICEF_SUSI_Batch1.csv",
    PROJECT_ROOT / "raw_data" / "UNICEF_SUSI_Batch1.csv",
    Path("UNICEF_SUSI_Batch1.csv"),
]
OUT_DIR = PROJECT_ROOT / "public" / "data"

MDP_PILOT_STATES = ["ABIA", "BENUE", "OYO", "SOKOTO"]
DATA_MODES = ["nsr", "update"]

# ---------------------------------------------------------------------------
# Code Maps
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
    "1": "Agriculture / Crop Farming",
    "2": "Livestock / Pastoralism",
    "3": "Fisheries / Aquaculture",
    "4": "Trading / Commerce",
    "5": "Artisan / Craftsmanship",
    "6": "Wage Labor / Formal",
    "7": "Informal Labor / Services",
    "8": "Other / Remittances",
}

SHOCK_CODE_MAP: Dict[str, str] = {
    "1": "Flooding",
    "2": "Drought / Water Scarcity",
    "3": "Severe Storm / Wind",
    "4": "Conflict / Violence",
    "5": "Epidemic / Disease Outbreak",
    "6": "Landslide / Erosion",
    "7": "Fire Outbreak",
    "8": "Economic / Other Shock",
}

DECILE_ORDINAL_MAP: Dict[str, int] = {
    "1st": 1, "2nd": 2, "3rd": 3, "4th": 4, "5th": 5,
    "6th": 6, "7th": 7, "8th": 8, "9th": 9, "10th": 10,
}

# Legacy 7-band pyramid
AGE_BANDS_PYRAMID = [
    ("0-4", 0, 4), ("5-11", 5, 11), ("12-17", 12, 17),
    ("18-24", 18, 24), ("25-49", 25, 49), ("50-64", 50, 64),
    ("65+", 65, 200),
]

OPTIONAL_TEXT_COLS = [
    "lga", "ward", "community", "communityid", "maritalstatus", "relationship",
    "urbanrural", "orphan", "currentlyenrolledinschl", "grade", "outofschoolgrade",
    "yearstopschool", "b5labour", "b6labour", "typeofdisability", "chronicallyilltype",
    "howfarishealthcentre", "livelihoods", "shock_type", "mechanism_type", "shock_year",
    "roof_dwelling", "floor_dwelling", "toilet_dwelling", "drink_dwelling",
    "light_dwelling", "cook_dwelling",
    "birthcertificate", "validnin", "disability", "chronicallyill", "pregnant",
    "lactating", "benefitfromhealthcare", "anyshocks", "rutf", "food", "cash",
    "dontknow", "muac_category",
]

YES_NO_FIELDS = {
    "_yes_birthcert":   "birthcertificate",
    "_yes_validnin":    "validnin",
    "_yes_disability":  "disability",
    "_yes_chronic":     "chronicallyill",
    "_yes_pregnant":    "pregnant",
    "_yes_lactating":   "lactating",
    "_yes_healthcare":  "benefitfromhealthcare",
    "_yes_anyshocks":   "anyshocks",
    "_yes_rutf":        "rutf",
    "_yes_food":        "food",
    "_yes_cash":        "cash",
    "_yes_dontknow":    "dontknow",
    "_yes_enrolled":    "currentlyenrolledinschl",
}

BLANK_TOKENS = ["", "nan", "none", "null"]

# ---------------------------------------------------------------------------
# Input Resolution
# ---------------------------------------------------------------------------

def find_input_csv() -> Path:
    if len(sys.argv) > 1 and os.path.exists(sys.argv[1]):
        return Path(sys.argv[1])
    for p in DEFAULT_PATHS:
        if os.path.exists(p):
            return Path(p)
    raise FileNotFoundError(f"Input CSV not found in candidate paths: {DEFAULT_PATHS}")

# ---------------------------------------------------------------------------
# Defensive Normalizers
# ---------------------------------------------------------------------------

def _norm_yes_no(val: Any) -> str:
    if val is None or (isinstance(val, float) and np.isnan(val)):
        return ""
    s = str(val).strip().lower()
    if s in ("yes", "y", "1", "1.0", "true", "t"):
        return "Yes"
    if s in ("no", "n", "0", "0.0", "false", "f"):
        return "No"
    return ""

def _norm_muac(val: Any) -> str:
    if val is None or (isinstance(val, float) and np.isnan(val)):
        return ""
    s = str(val).strip()
    if s == "" or s.lower() == "nan":
        return ""
    if s in ("1", "1.0"): return "Green"
    if s in ("2", "2.0"): return "Yellow"
    if s in ("3", "3.0"): return "Red"
    return s.title()

def _norm_decile(val: Any) -> Optional[int]:
    if val is None or (isinstance(val, float) and np.isnan(val)):
        return None
    s = str(val).strip().lower()
    if s in DECILE_ORDINAL_MAP:
        return DECILE_ORDINAL_MAP[s]
    try:
        n = int(float(s))
        if 1 <= n <= 10:
            return n
    except (ValueError, TypeError):
        pass
    return None

def _decode_multi_codes(val: Any, code_map: Dict[str, str],
                        unknown_prefix: Optional[str] = None) -> List[str]:
    if val is None or (isinstance(val, float) and np.isnan(val)):
        return []
    s = str(val).strip()
    if s.lower() in BLANK_TOKENS:
        return []
    if not re.search(r"\d", s):
        return [s] if unknown_prefix is not None else []
    s = re.sub(r"(?<=\d)\.0+(?!\d)", "", s)
    out: List[str] = []
    for tok in (t for t in re.split(r"[\s,;|/]+", s) if t):
        lbl = code_map.get(tok)
        if lbl is None and unknown_prefix is not None:
            lbl = f"{unknown_prefix} {tok}"
        if lbl and lbl not in out:
            out.append(lbl)
    return out

def _num_col(df: pd.DataFrame, *names: str) -> pd.Series:
    for n in names:
        if n in df.columns:
            return pd.to_numeric(df[n], errors="coerce")
    return pd.Series(np.nan, index=df.index, dtype="float64")

def _pct_of(n: int, d: int) -> float:
    return round(100 * n / d, 2) if d else 0.0

def _non_blank_count(series: pd.Series) -> int:
    s = series.dropna().astype(str).str.strip().str.lower()
    return int((~s.isin(BLANK_TOKENS)).sum())

# ---------------------------------------------------------------------------
# JSON writer
# ---------------------------------------------------------------------------

def _clean(o: Any) -> Any:
    if isinstance(o, dict):
        return {str(k): _clean(v) for k, v in o.items()}
    if isinstance(o, (list, tuple)):
        return [_clean(v) for v in o]
    if isinstance(o, np.bool_):
        return bool(o)
    if isinstance(o, np.integer):
        return int(o)
    if isinstance(o, (np.floating, float)):
        f = float(o)
        return None if (np.isnan(f) or np.isinf(f)) else f
    return o

def _write_json(path: Path, obj: Any, indent: Optional[int] = 2) -> None:
    path.write_text(json.dumps(_clean(obj), indent=indent, ensure_ascii=False), encoding="utf-8")

# ---------------------------------------------------------------------------
# Data Loading and Preprocessing
# ---------------------------------------------------------------------------

def load_and_clean(csv_path: Path) -> pd.DataFrame:
    print(f"[*] Loading raw dataset: {csv_path} ...")
    df = pd.read_csv(csv_path, low_memory=False)
    print(f"[*] Loaded {len(df):,} individual rows x {len(df.columns)} columns")

    missing_required = [c for c in ("state", "sex", "agey") if c not in df.columns]
    if missing_required:
        raise ValueError(f"CSV is missing required column(s): {missing_required}")

    for col in OPTIONAL_TEXT_COLS:
        if col not in df.columns:
            df[col] = pd.Series(np.nan, index=df.index, dtype="object")

    df["state"] = df["state"].astype(str).str.strip().str.upper()
    for col in ("lga", "ward", "community", "communityid", "hhnsrrno"):
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip()

    df["agey"] = _num_col(df, "agey")
    df["agem"] = _num_col(df, "agem")
    df["pmt"]  = _num_col(df, "pmtscore", "pmt")

    if df["agem"].notna().any() and df["agem"].max() > 11:
        df["age_months"] = df["agem"].fillna(df["agey"] * 12)
    else:
        df["age_months"] = df["agey"] * 12 + df["agem"].fillna(0)

    if "decile" in df.columns:
        df["decile"] = pd.to_numeric(df["decile"].map(_norm_decile), errors="coerce")
    else:
        df["decile"] = np.nan

    df["sex_clean"] = (
        df["sex"].astype(str).str.strip().str.title().replace({"M": "Male", "F": "Female"})
    )
    df["is_female"] = df["sex_clean"] == "Female"
    df["is_male"]   = df["sex_clean"] == "Male"

    for new_col, src_col in YES_NO_FIELDS.items():
        df[new_col] = df[src_col].map(_norm_yes_no)

    df["_muac_cat"] = df["muac_category"].map(_norm_muac)

    df["is_head"] = (
        df["relationship"].astype(str).str.strip().str.title()
        .isin(["Head", "Household Head", "Head Of Household"])
    )

    return df

# ---------------------------------------------------------------------------
# Helper Aggregators
# ---------------------------------------------------------------------------

def _hh_dedupe(df: pd.DataFrame) -> pd.DataFrame:
    if "hhnsrrno" in df.columns:
        return df.drop_duplicates(subset=["hhnsrrno"], keep="first")
    return df

def _heads_hh(df: pd.DataFrame) -> pd.DataFrame:
    if "hhnsrrno" not in df.columns:
        return df.iloc[0:0]
    heads = df[df["is_head"]]
    return heads.drop_duplicates(subset=["hhnsrrno"], keep="first")

def _dist(series: pd.Series, top_n: Optional[int] = None) -> List[Dict[str, Any]]:
    s = series.dropna()
    s = s[~s.astype(str).str.strip().str.lower().isin(BLANK_TOKENS)]
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
    return {"n": n, "d": d, "pct": round(100 * n / d, 2) if d else 0.0}

def _oos_stats(sub: pd.DataFrame) -> Dict[str, Any]:
    total = len(sub)
    answered = int(sub["_yes_enrolled"].isin(["Yes", "No"]).sum())
    enrolled = int((sub["_yes_enrolled"] == "Yes").sum())
    oos = int((sub["_yes_enrolled"] == "No").sum())
    return {
        "total": total, "answered": answered, "enrolled": enrolled, "oos": oos,
        "oos_pct": _pct_of(oos, answered),
        "oos_pct_of_total": _pct_of(oos, total),
    }

def _oos_band(df: pd.DataFrame, lo: int, hi: int) -> Dict[str, Any]:
    sub = df[(df["agey"] >= lo) & (df["agey"] <= hi)]
    out = _oos_stats(sub)
    out["male"] = _oos_stats(sub[sub["is_male"]])
    out["female"] = _oos_stats(sub[sub["is_female"]])
    return out

def _civil_gender(sub: pd.DataFrame) -> Dict[str, Any]:
    tot = len(sub)
    cert = int((sub["_yes_birthcert"] == "Yes").sum())
    nin = int((sub["_yes_validnin"] == "Yes").sum())
    return {
        "total": tot, "birth_cert_yes": cert, "nin_yes": nin,
        "birth_cert_pct": _pct_of(cert, tot), "nin_pct": _pct_of(nin, tot),
    }

def _civil_reg_block(sub: pd.DataFrame) -> Dict[str, Any]:
    denom = len(sub)
    has_c = sub["_yes_birthcert"] == "Yes"
    has_n = sub["_yes_validnin"] == "Yes"
    cert_y = int(has_c.sum())
    nin_y = int(has_n.sum())
    both = int((has_c & has_n).sum())
    cert_only = int((has_c & ~has_n).sum())
    nin_only = int((~has_c & has_n).sum())
    neither = int((~has_c & ~has_n).sum())
    return {
        "total": denom,
        "birth_cert_yes": cert_y, "birth_cert_no": denom - cert_y,
        "birth_cert_pct": _pct_of(cert_y, denom),
        "nin_yes": nin_y, "nin_no": denom - nin_y,
        "nin_pct": _pct_of(nin_y, denom),
        "both": both, "both_pct": _pct_of(both, denom),
        "cert_only": cert_only, "cert_only_pct": _pct_of(cert_only, denom),
        "nin_only": nin_only, "nin_only_pct": _pct_of(nin_only, denom),
        "neither": neither, "neither_pct": _pct_of(neither, denom),
        "by_gender": {
            "male": _civil_gender(sub[sub["is_male"]]),
            "female": _civil_gender(sub[sub["is_female"]]),
        },
    }

def _muac_stats(sub: pd.DataFrame) -> Dict[str, Any]:
    total = len(sub)
    sam = int((sub["_muac_cat"] == "Red").sum())
    mam = int((sub["_muac_cat"] == "Yellow").sum())
    normal = int((sub["_muac_cat"] == "Green").sum())
    return {
        "total": total, "sam": sam, "mam": mam, "normal": normal,
        "sam_pct": _pct_of(sam, total), "mam_pct": _pct_of(mam, total),
        "normal_pct": _pct_of(normal, total),
        "wasting_pct": _pct_of(sam + mam, total),
    }

def _youth_stats(sub: pd.DataFrame) -> Dict[str, Any]:
    total = len(sub)
    lab = sub["b5labour"].astype(str).str.strip().str.title()
    not_stated = int(lab.str.lower().isin(BLANK_TOKENS).sum())
    answered = total - not_stated
    unemp = int(lab.isin(["Unemployed", "Dependant"]).sum())
    stud = int((lab == "Pupil/Student").sum())
    return {
        "total": total, "answered": answered, "not_stated": not_stated,
        "employed": max(answered - unemp - stud, 0),
        "unemployed": unemp, "student": stud,
        "unemployment_rate": _pct_of(unemp, answered),
    }

# ---------------------------------------------------------------------------
# Core Domain Blocks (v3.5 Compatible)
# ---------------------------------------------------------------------------

def nsr_block(df: pd.DataFrame) -> Dict[str, Any]:
    hh = _hh_dedupe(df)
    total_hh = len(hh)
    total_ind = len(df)
    n_fem = int(df["is_female"].sum())
    n_male = int(df["is_male"].sum())
    u5 = int((df["agey"] < 5).sum())
    u18 = int((df["agey"] < 18).sum())
    elderly = int((df["agey"] >= 60).sum())
    pwd = int((df["_yes_disability"] == "Yes").sum())
    orphans = int((df["orphan"] == "Yes").sum())

    nin_verified = int(((df["agey"] >= 16) & (df["_yes_validnin"] == "Yes")).sum())
    nin_eligible = int(((df["agey"] >= 16) & df["_yes_validnin"].isin(["Yes", "No"])).sum())
    nin_total = total_ind

    urban_hh = int((hh["urbanrural"] == "Urban").sum())
    rural_hh = int((hh["urbanrural"] == "Rural").sum())

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
    pmt = df["pmt"].dropna()
    decile = hh["decile"].dropna()

    dec_counts = {f"d{i}": int((decile == i).sum()) for i in range(1, 11)}
    poorest = int((decile <= 3).sum())
    total_hh = len(hh)
    poorest_pct = round(100 * poorest / total_hh, 2) if total_hh else 0.0

    roof_improved = {"Zinc/Aluminium", "Concrete/Cement", "Roofing Tiles", "Asbestos", "Corrugated Iron Sheet"}
    floor_improved = {"Cement/Concrete", "Ceramic/Marble Tiles", "Wood/Plank", "Carpet/Rugs"}
    toilet_improved = {"Flush Toilet", "Ventilated Improved Pit Latrine", "Piped Sewer System", "Septic Tank", "VIP Laterine"}
    water_improved = {"Piped Water", "Borehole/Tube Well", "Protected Dug Well", "Protected Spring", "Rainwater", "Borehole"}

    def _improved_pct(col: str, ok: set) -> float:
        if col not in hh.columns:
            return 0.0
        s = hh[col].astype(str).str.strip().str.lower()
        ok_l = {x.lower() for x in ok}
        return round(100 * s.isin(ok_l).sum() / len(s), 2) if len(s) else 0.0

    return {
        "pmt_mean":   round(float(pmt.mean()), 2)   if len(pmt) else 0.0,
        "pmt_median": round(float(pmt.median()), 2) if len(pmt) else 0.0,
        "decile_distribution": dec_counts,
        "poorest_households": poorest,
        "poorest_pct": poorest_pct,
        "vulnerability_index": round(poorest_pct * 1.4, 2),
        "improved_roof_pct":   _improved_pct("roof_dwelling",   roof_improved),
        "improved_floor_pct":  _improved_pct("floor_dwelling",  floor_improved),
        "improved_toilet_pct": _improved_pct("toilet_dwelling", toilet_improved),
        "improved_water_pct":  _improved_pct("drink_dwelling",  water_improved),
    }

def unicef_block(df: pd.DataFrame) -> Dict[str, Any]:
    agey = df["agey"]

    def _attend_pct(lo: int, hi: int) -> tuple[float, int, int]:
        mask = (agey >= lo) & (agey <= hi)
        total = int(mask.sum())
        if total == 0:
            return 0.0, 0, 0
        e = df.loc[mask, "_yes_enrolled"]
        n_answered = int(e.isin(["Yes", "No"]).sum())
        n_yes = int((e == "Yes").sum())
        pct = round(100 * n_yes / n_answered, 2) if n_answered else 0.0
        return pct, total, n_answered

    prim_pct, n_611,  n_ans_611  = _attend_pct(6, 11)
    lsec_pct, n_1214, n_ans_1214 = _attend_pct(12, 14)
    usec_pct, n_1517, n_ans_1517 = _attend_pct(15, 17)

    school_age = (agey >= 6) & (agey <= 17)
    enrol = df.loc[school_age, "_yes_enrolled"]
    n_answered_all = int(enrol.isin(["Yes", "No"]).sum())
    n_no = int((enrol == "No").sum())
    oos_pct = round(100 * n_no / n_answered_all, 2) if n_answered_all else 0.0

    u5 = (agey < 5)
    u5_total = int(u5.sum())
    muac_u5 = df.loc[u5, "_muac_cat"]
    screened = int(muac_u5.isin(["Green", "Yellow", "Red"]).sum())
    n_yellow = int((muac_u5 == "Yellow").sum())
    n_red    = int((muac_u5 == "Red").sum())
    wasting  = n_yellow + n_red
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
# Enhanced Extended Block (v4.0.1 UNICEF Revamp Integration)
# ---------------------------------------------------------------------------

def extended_block(df: pd.DataFrame) -> Dict[str, Any]:
    agey = df["agey"]
    hh = _hh_dedupe(df)
    total_hh = len(hh)
    total_ind = len(df)
    has_hh = "hhnsrrno" in df.columns

    # 1. Age-Sex Pyramid
    pyramid = []
    for label, lo, hi in AGE_BANDS_PYRAMID:
        mask = (agey >= lo) & (agey <= hi)
        m = int((mask & df["is_male"]).sum())
        f = int((mask & df["is_female"]).sum())
        pyramid.append({"band": label, "male": m, "female": f, "total": m + f})

    # 2. Marital Status
    marital_dist = _dist(df.loc[agey >= 15, "maritalstatus"])

    # 3. Female Primary Respondent / Head
    heads_hh = _heads_hh(df)
    total_heads = len(heads_hh)
    female_heads = int(heads_hh["is_female"].sum())
    female_primary_respondent = {
        "n": female_heads, "d": total_heads,
        "pct": _pct_of(female_heads, total_heads),
        "note": "Primary respondent / head of household per survey methodology.",
    }

    # 4. Civil Registration Cross-tabs (0-17, 0-5, 6-17, Adults)
    civil_reg_0_17   = _civil_reg_block(df[agey < 18])
    civil_reg_0_5    = _civil_reg_block(df[agey <= 5])
    civil_reg_6_17   = _civil_reg_block(df[(agey >= 6) & (agey <= 17)])
    civil_reg_adults = _civil_reg_block(df[agey >= 18])

    # 5. Education V2 Disaggregations
    oos_6_17  = _oos_band(df, 6, 17)
    oos_6_9   = _oos_band(df, 6, 9)
    oos_10_14 = _oos_band(df, 10, 14)
    oos_15_17 = _oos_band(df, 15, 17)
    oos_6_14  = _oos_band(df, 6, 14)

    dis_6_17 = df[(agey >= 6) & (agey <= 17) & (df["_yes_disability"] == "Yes")]
    disabled_children_education = _oos_stats(dis_6_17)

    school_6_17 = (agey >= 6) & (agey <= 17)
    in_school_6_17 = df[school_6_17 & (df["_yes_enrolled"] == "Yes")]
    grade_dist = _dist(in_school_6_17["grade"], top_n=8)

    oos_school_6_17 = df[school_6_17 & (df["_yes_enrolled"] == "No")]
    oos_grade_dist = _dist(oos_school_6_17["outofschoolgrade"], top_n=8)
    dropout_dist = _dist(oos_school_6_17["yearstopschool"], top_n=6)

    # 6. Nutrition V2 (true 6-59 months)
    months = df["age_months"]
    muac_eligible = df[(months >= 6) & (months <= 59) & df["_muac_cat"].isin(["Green", "Yellow", "Red"])]
    muac_denom = len(muac_eligible)
    nut_all = _muac_stats(muac_eligible)
    sam_count, mam_count, normal_count = nut_all["sam"], nut_all["mam"], nut_all["normal"]
    wasted_count = sam_count + mam_count

    nutrition_v2 = {
        "eligible_under5": muac_denom,
        "sam_count": sam_count, "mam_count": mam_count,
        "normal_count": normal_count, "wasted_count": wasted_count,
        "sam_pct": nut_all["sam_pct"], "mam_pct": nut_all["mam_pct"],
        "normal_pct": nut_all["normal_pct"], "wasting_pct": nut_all["wasting_pct"],
        "by_gender": {
            "male": _muac_stats(muac_eligible[muac_eligible["is_male"]]),
            "female": _muac_stats(muac_eligible[muac_eligible["is_female"]]),
        },
        "placeholders": {
            "pregnant_enrolled_fn": {"status": "not_collected", "label": "Pregnant women enrolled in F&N programme"},
            "malnourished_children_enrolled_fn": {"status": "not_collected", "label": "Children with malnutrition enrolled in F&N programme"},
        },
    }

    # 7. Health V2
    p_df = df[df["_yes_pregnant"] == "Yes"]
    pregnant_by_age = {
        "under_18": int((p_df["agey"] < 18).sum()),
        "18_24": int(((p_df["agey"] >= 18) & (p_df["agey"] <= 24)).sum()),
        "25_34": int(((p_df["agey"] >= 25) & (p_df["agey"] <= 34)).sum()),
        "35_plus": int((p_df["agey"] >= 35).sum()),
    }

    is_pwd = df["_yes_disability"] == "Yes"
    plwd_total = int(is_pwd.sum())
    plwd_males = int((df["is_male"] & is_pwd).sum())
    plwd_females = int((df["is_female"] & is_pwd).sum())
    n_children = int((agey < 18).sum())
    children_plwd = int(((agey < 18) & is_pwd).sum())

    pregnant_total = int((df["_yes_pregnant"] == "Yes").sum())
    lactating_total = int((df["_yes_lactating"] == "Yes").sum())

    health_v2 = {
        "pregnant_total": pregnant_total,
        "pregnant_caveat": "High survey non-response (63.1% missing in instrument)",
        "pregnant_by_age": pregnant_by_age,
        "lactating_total": lactating_total,
        "lactating_caveat": "High survey non-response (89.7% missing in instrument)",
        "plwd_total": plwd_total, "plwd_male": plwd_males, "plwd_female": plwd_females,
        "plwd_pct": _pct_of(plwd_total, total_ind),
        "children_plwd": children_plwd,
        "children_plwd_pct": _pct_of(children_plwd, n_children),
        "placeholders": {
            "hhs_with_health_insurance": {"status": "not_collected", "label": "HHs with Health Insurance"},
            "health_insurance_type": {"status": "not_collected", "label": "Health Insurance Type"},
            "hhs_with_no_health_insurance": {"status": "not_collected", "label": "HHs with No Health Insurance"},
            "children_0_7_covered_insurance": {"status": "not_collected", "label": "Children 0-7 in HH covered by insurance"},
            "children_0_5_covered_insurance": {"status": "not_collected", "label": "Children 0-5 in HH covered by insurance"},
        },
    }

    # 8. Youth (18-24) — with sex split
    youth_df = df[(agey >= 18) & (agey <= 24)]
    youth_data = _youth_stats(youth_df)
    youth_data["labour_breakdown"] = _dist(youth_df["b5labour"])
    youth_data["by_gender"] = {
        "male": _youth_stats(youth_df[youth_df["is_male"]]),
        "female": _youth_stats(youth_df[youth_df["is_female"]]),
    }

    # 9. Livelihoods & Resilience V2
    if has_hh:
        hh_ids = pd.Index(df["hhnsrrno"].unique())

        def _hh_flag(mask: pd.Series) -> np.ndarray:
            return hh_ids.isin(df.loc[mask, "hhnsrrno"].unique())

        f_u5  = _hh_flag(agey <= 5)
        f_pwd = _hh_flag(is_pwd)
        f_eld = _hh_flag(agey >= 65)
        f_plw = _hh_flag((df["_yes_pregnant"] == "Yes") | (df["_yes_lactating"] == "Yes"))

        hh_sizes = df.groupby("hhnsrrno").size()
        large_hhs = int((hh_sizes >= 8).sum())
        multi_vuln = int((np.sum([f_u5, f_pwd, f_eld, f_plw], axis=0) >= 2).sum())
        hh_disab_cnt = int(f_pwd.sum())
    else:
        large_hhs = multi_vuln = hh_disab_cnt = 0

    shock_hhs = hh[hh["_yes_anyshocks"] == "Yes"]
    shock_hh_cnt = len(shock_hhs)

    shock_counts: Dict[str, int] = {}
    for v in shock_hhs["shock_type"]:
        for lbl in _decode_multi_codes(v, SHOCK_CODE_MAP, unknown_prefix="Shock"):
            shock_counts[lbl] = shock_counts.get(lbl, 0) + 1
    shock_dist = [
        {"type": lbl, "count": int(cnt), "pct": _pct_of(cnt, shock_hh_cnt)}
        for lbl, cnt in sorted(shock_counts.items(), key=lambda kv: -kv[1])
    ]

    coping_dist = _dist(shock_hhs["mechanism_type"], top_n=8)
    coping_answered = _non_blank_count(shock_hhs["mechanism_type"])

    pvhh_households = int((hh["decile"] <= 3).sum())

    livelihoods_v2 = {
        "livelihoods": _dist(hh["livelihoods"]),
        "large_households": {"count": large_hhs, "pct": _pct_of(large_hhs, total_hh)},
        "multi_vulnerable_households": {"count": multi_vuln, "pct": _pct_of(multi_vuln, total_hh)},
        "hh_with_disability": {"count": hh_disab_cnt, "pct": _pct_of(hh_disab_cnt, total_hh)},
        "pvhh_households": {"count": pvhh_households, "pct": _pct_of(pvhh_households, total_hh)},
        "shock_exposure": {
            "shock_hh_count": shock_hh_cnt,
            "shock_hh_pct": _pct_of(shock_hh_cnt, total_hh),
            "types": shock_dist,
            "coping_mechanisms": coping_dist,
        },
    }

    # 10. UNICEF V2 Age Bands (x sex)
    def _age_band_cnt(mask: pd.Series) -> Dict[str, int]:
        sub = df[mask]
        return {"total": len(sub), "male": int(sub["is_male"].sum()), "female": int(sub["is_female"].sum())}

    age_bands_v2 = {
        "0-3":   _age_band_cnt(agey <= 3),
        "0-5":   _age_band_cnt(agey <= 5),
        "0-7":   _age_band_cnt(agey <= 7),
        "0-17":  _age_band_cnt(agey < 18),
        "6-9":   _age_band_cnt((agey >= 6) & (agey <= 9)),
        "6-17":  _age_band_cnt((agey >= 6) & (agey <= 17)),
        "10-14": _age_band_cnt((agey >= 10) & (agey <= 14)),
        "15-17": _age_band_cnt((agey >= 15) & (agey <= 17)),
        "18-24": _age_band_cnt((agey >= 18) & (agey <= 24)),
        "18+":   _age_band_cnt(agey >= 18),
    }

    # 11. Children in PVHH & Risk HH
    total_children = n_children
    pvhh_children = int(((agey < 18) & (df["decile"] <= 3)).sum())

    if has_hh and shock_hh_cnt:
        shock_hh_ids = set(shock_hhs["hhnsrrno"])
        risk_children = int(((agey < 18) & df["hhnsrrno"].isin(shock_hh_ids)).sum())
    else:
        risk_children = 0

    women_repro = int((df["is_female"] & (agey >= 15) & (agey <= 49)).sum())
    asked_n = int(df["_yes_rutf"].isin(["Yes", "No"]).sum())
    asked_d = max(asked_n, 1)

    all_nin_yes = int((df["_yes_validnin"] == "Yes").sum())
    chronic_yes = int((df["_yes_chronic"] == "Yes").sum())

    return {
        "age_sex_pyramid": pyramid,
        "marital_status": marital_dist,
        "female_primary_respondent": female_primary_respondent,
        "birth_cert": {
            "under_5": {"n": civil_reg_0_5["birth_cert_yes"], "d": civil_reg_0_5["total"], "pct": civil_reg_0_5["birth_cert_pct"]},
            "age_6_17": {"n": civil_reg_6_17["birth_cert_yes"], "d": civil_reg_6_17["total"], "pct": civil_reg_6_17["birth_cert_pct"]},
            "all_children": {"n": civil_reg_0_17["birth_cert_yes"], "d": civil_reg_0_17["total"], "pct": civil_reg_0_17["birth_cert_pct"]},
        },
        "individual_nin": {
            "children": {"n": civil_reg_0_17["nin_yes"], "d": civil_reg_0_17["total"], "pct": civil_reg_0_17["nin_pct"]},
            "adults": {"n": civil_reg_adults["nin_yes"], "d": civil_reg_adults["total"], "pct": civil_reg_adults["nin_pct"]},
            "all": {"n": all_nin_yes, "d": total_ind, "pct": _pct_of(all_nin_yes, total_ind)},
        },
        "disability": {
            "rate": {"n": plwd_total, "d": total_ind, "pct": health_v2["plwd_pct"]},
            "types": _dist(df["typeofdisability"], top_n=8),
        },
        "chronic_illness": {
            "rate": {"n": chronic_yes, "d": total_ind, "pct": _pct_of(chronic_yes, total_ind)},
            "types": _dist(df["chronicallyilltype"], top_n=8),
        },
        "housing": {
            "roof": _dist(hh["roof_dwelling"]),
            "floor": _dist(hh["floor_dwelling"]),
            "toilet": _dist(hh["toilet_dwelling"]),
            "water": _dist(hh["drink_dwelling"]),
            "light": _dist(hh["light_dwelling"]),
            "cook": _dist(hh["cook_dwelling"]),
        },
        "healthcare_access": {
            "benefits_pct": _rate(df["_yes_healthcare"] == "Yes", df["_yes_healthcare"].isin(["Yes", "No"])),
            "distance_dist": _dist(df["howfarishealthcentre"]),
            "distance_coverage_pct": _pct_of(_non_blank_count(df["howfarishealthcentre"]), total_ind),
        },
        "livelihoods": {
            "labour_status": _dist(df["b5labour"]),
            "industry": _dist(df["b6labour"]),
            "code_dist": livelihoods_v2["livelihoods"],
        },
        "shocks": {
            "exposure_pct": {"n": shock_hh_cnt, "d": total_hh, "pct": livelihoods_v2["shock_exposure"]["shock_hh_pct"]},
            "types": shock_dist,
            "years": _dist(shock_hhs["shock_year"]),
        },
        "coping": {
            "mechanisms": coping_dist,
            "coverage_pct": _pct_of(coping_answered, shock_hh_cnt),
            "shock_exposed_hh": shock_hh_cnt,
        },
        "assistance_awareness": {
            "asked_n": asked_n,
            "rutf_yes_pct": round(int((df["_yes_rutf"] == "Yes").sum()) / asked_d * 100, 2),
            "food_yes_pct": round(int((df["_yes_food"] == "Yes").sum()) / asked_d * 100, 2),
            "cash_yes_pct": round(int((df["_yes_cash"] == "Yes").sum()) / asked_d * 100, 2),
            "dontknow_yes_pct": round(int((df["_yes_dontknow"] == "Yes").sum()) / asked_d * 100, 2),
        },
        "plw": {
            "women_repro_age": women_repro,
            "pregnant": {"n": pregnant_total, "d": women_repro, "pct": _pct_of(pregnant_total, women_repro)},
            "lactating": {"n": lactating_total, "d": women_repro, "pct": _pct_of(lactating_total, women_repro)},
        },
        "muac_distribution": {
            "categories": {"Green": normal_count, "Yellow": mam_count, "Red": sam_count},
            "measured_n": muac_denom,
        },
        "age_bands_unicef": [
            {"band": "0-5", "total": age_bands_v2["0-5"]["total"]},
            {"band": "6-14", "total": age_bands_v2["6-9"]["total"] + age_bands_v2["10-14"]["total"]},
            {"band": "15-17", "total": age_bands_v2["15-17"]["total"]},
        ],
        "children_in_pvhh": {"n": pvhh_children, "d": total_children, "pct": _pct_of(pvhh_children, total_children)},
        "children_in_risk_hh": {"n": risk_children, "d": total_children, "pct": _pct_of(risk_children, total_children)},
        "oos_by_band": {"age_6_14": oos_6_14, "age_15_17": oos_15_17, "combined_6_17": oos_6_17},
        "no_health_insurance": {
            "n": total_hh, "d": total_hh, "pct": 100.0,
            "status": "not_collected", "note": "Data not collected in survey wave",
        },

        # ---- New v4.0.1 UNICEF Revamp additions ----
        "age_bands_v2": age_bands_v2,
        "civil_registration": {
            "children_0_17": civil_reg_0_17,
            "children_0_5": civil_reg_0_5,
            "children_6_17": civil_reg_6_17,
            "adults": civil_reg_adults,
        },
        "education_v2": {
            "oos_6_17": oos_6_17,
            "oos_6_9": oos_6_9,
            "oos_10_14": oos_10_14,
            "oos_15_17": oos_15_17,
            "oos_6_14": oos_6_14,
            "disabled_children": disabled_children_education,
            "grade_distribution": grade_dist,
            "oos_grade_distribution": oos_grade_dist,
            "dropout_period": dropout_dist,
        },
        "nutrition_v2": nutrition_v2,
        "health_v2": health_v2,
        "youth": youth_data,
        "livelihoods_resilience_v2": livelihoods_v2,
    }

# ---------------------------------------------------------------------------
# Level Assembler
# ---------------------------------------------------------------------------

def assemble_level(df: pd.DataFrame, level: str, keys: Dict[str, str]) -> Dict[str, Any]:
    out: Dict[str, Any] = {
        "nsr":           nsr_block(df),
        "update":        update_block(df),
        "vulnerability": vulnerability_block(df),
        "unicef":        unicef_block(df),
        "extended":      extended_block(df),
        "level":         level,
    }
    out.update(keys)
    return out

# ---------------------------------------------------------------------------
# Main Execution Entry Point
# ---------------------------------------------------------------------------

def _blank(v: Any) -> bool:
    return v is None or str(v).strip().lower() in BLANK_TOKENS

def main() -> None:
    start_time = datetime.now()
    csv_path = find_input_csv()
    df = load_and_clean(csv_path)

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    print("\n[*] 1. Aggregating National summary ...")
    national = assemble_level(df, "national", {})
    _write_json(OUT_DIR / "national_summary.json", national)

    print("[*] 2. Aggregating State summaries ...")
    states = []
    for state, sub in df.groupby("state"):
        if _blank(state):
            continue
        states.append(assemble_level(sub, "state", {"state": state}))
    _write_json(OUT_DIR / "states_summary.json", states)
    print(f"    -> {len(states)} state summaries written")

    print("[*] 3. Aggregating LGA summaries ...")
    lgas = []
    for (state, lga), sub in df.groupby(["state", "lga"]):
        if _blank(state) or _blank(lga):
            continue
        lgas.append(assemble_level(sub, "lga", {"state": state, "lga": lga}))
    _write_json(OUT_DIR / "lga_summary.json", lgas)
    print(f"    -> {len(lgas)} LGA summaries written")

    print("[*] 4. Aggregating Ward summaries ...")
    wards = []
    for (state, lga, ward), sub in df.groupby(["state", "lga", "ward"]):
        if _blank(state) or _blank(lga) or _blank(ward):
            continue
        wards.append(assemble_level(sub, "ward", {"state": state, "lga": lga, "ward": ward}))
    _write_json(OUT_DIR / "ward_summary.json", wards, indent=None)
    print(f"    -> {len(wards)} ward summaries written")

    print("[*] 5. Aggregating Community summaries ...")
    communities = []
    for i, ((state, lga, ward, comm), sub) in enumerate(
        df.groupby(["state", "lga", "ward", "community"]), start=1
    ):
        if _blank(state) or _blank(lga) or _blank(ward) or _blank(comm):
            continue
        communities.append(assemble_level(sub, "community", {
            "state": state, "lga": lga, "ward": ward, "community": comm,
        }))
        if i % 500 == 0:
            print(f"    ... {i:,} community groups processed")
    _write_json(OUT_DIR / "community_summary.json", communities, indent=None)
    print(f"    -> {len(communities)} community summaries written")

    print("[*] 6. Aggregating Timeseries ...")
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
                "nin_verified": int(((sub["agey"] >= 16) & (sub["_yes_validnin"] == "Yes")).sum()),
                "pmt_mean": round(float(sub_hh["pmt"].dropna().mean()), 2) if sub_hh["pmt"].notna().any() else 0.0,
            })
    _write_json(OUT_DIR / "timeseries.json", ts_rows)
    print(f"    -> {len(ts_rows)} timeseries rows written")

    print("[*] 7. Generating Metadata ...")
    total_hh_count = len(_hh_dedupe(df))
    meta = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_csv": str(csv_path.name),
        "source_rows": len(df),
        "total_households": total_hh_count,
        "total_members": len(df),
        "states_count": len(states),
        "lga_count": len(lgas),
        "ward_count": len(wards),
        "community_count": len(communities),
        "mdp_states": MDP_PILOT_STATES,
        "data_modes": DATA_MODES,
        "aggregator_version": "4.0.1-unicef-revamp",
        "code_maps": {
            "disability": DISABILITY_CODE_MAP,
            "chronic_ill": CHRONIC_ILL_CODE_MAP,
            "livelihood": LIVELIHOOD_CODE_MAP,
            "shock_types": SHOCK_CODE_MAP,
            "decile": {k: v for k, v in DECILE_ORDINAL_MAP.items()},
        },
    }
    _write_json(OUT_DIR / "metadata.json", meta)

    elapsed = (datetime.now() - start_time).total_seconds()
    print(f"\n[+] Aggregation completed successfully in {elapsed:.1f}s!")
    print(f"[+] Output written to: {OUT_DIR}")


if __name__ == "__main__":
    main()