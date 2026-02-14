"""
Rule-based PDF extraction for patient intake.
Extracts: age, stage, ER/PR/HER2, node involvement, comorbidities, ZIP.
No paid APIs; local parsing only.
"""
import io
import re
from typing import Any, Dict, Optional

from pypdf import PdfReader


# Patterns (case-insensitive, flexible for clinical notes)
PATTERN_AGE = re.compile(r"\b(?:age|DOB|y\.?o\.?|years?\s+old)\s*[:\s]*(\d{2,3})\b", re.I)
PATTERN_AGE_STANDALONE = re.compile(r"\b(?:patient\s+is\s+)?(\d{2,3})\s*(?:y\.?o\.?|years?\s+old|yo)\b", re.I)
PATTERN_STAGE = re.compile(r"\b(?:stage|AJCC)\s*[:\s]*([IViv1234]+)\b", re.I)
PATTERN_ER = re.compile(r"\b(?:ER|estrogen)\s*(?:receptor)?\s*[:\s]*(positive|negative|pos|neg|\+|\-)\b", re.I)
PATTERN_PR = re.compile(r"\b(?:PR|progesterone)\s*(?:receptor)?\s*[:\s]*(positive|negative|pos|neg|\+|\-)\b", re.I)
PATTERN_HER2 = re.compile(r"\bHER2\s*[:\s]*(positive|negative|pos|neg|\+|\-)\b", re.I)
PATTERN_NODE = re.compile(r"\b(?:node|nodes|LN)\s*(?:involvement|positive|status)?\s*[:\s]*(positive|negative|pos|neg|\+|\-|involved)\b", re.I)
PATTERN_ZIP = re.compile(r"\b(\d{5})(?:-\d{4})?\b")
# Comorbidities: look for common terms
PATTERN_DIABETES = re.compile(r"\b(?:diabetes|DM|T2DM|type\s*2)\b", re.I)
PATTERN_CVD = re.compile(r"\b(?:cardiovascular|CVD|CHF|CAD|hypertension|HTN|heart\s+disease)\b", re.I)
PATTERN_COMORBID = re.compile(r"\b(?:comorbidities?|medical\s+history|PMH)\s*[:\s]*([^.]+?)(?=\n|$)", re.I)


def _parse_pos_neg(m: Optional[re.Match]) -> Optional[bool]:
    if not m:
        return None
    v = m.group(1).strip().lower()
    if v in ("positive", "pos", "+", "involved"):
        return True
    if v in ("negative", "neg", "-"):
        return False
    return None


def _parse_stage(s: str) -> Optional[str]:
    if not s:
        return None
    s = s.strip().upper()
    if s in ("I", "II", "III", "IV"):
        return s
    if s in ("1", "2", "3", "4"):
        return {"1": "I", "2": "II", "3": "III", "4": "IV"}[s]
    return None


def extract_patient_profile_from_text(text: str) -> Dict[str, Any]:
    """
    Rule-based extraction from plain text. Returns dict suitable for PatientProfile.
    """
    out: Dict[str, Any] = {
        "age": None,
        "zip_code": None,
        "stage_at_diagnosis": None,
        "er_positive": None,
        "pr_positive": None,
        "her2_positive": None,
        "node_positive": None,
        "comorbidities": [],
        "current_symptoms": [],
        "menopausal_status": "unknown",
        "fertility_preservation_concern": False,
        "treatment_adherence": 1.0,
    }
    if not text or not text.strip():
        return out

    # Age
    for pat in (PATTERN_AGE, PATTERN_AGE_STANDALONE):
        m = pat.search(text)
        if m:
            a = int(m.group(1))
            if 18 <= a <= 100:
                out["age"] = a
                break

    # Stage
    m = PATTERN_STAGE.search(text)
    if m:
        stage = _parse_stage(m.group(1))
        if stage:
            out["stage_at_diagnosis"] = stage

    # Receptors
    m = PATTERN_ER.search(text)
    if m:
        out["er_positive"] = _parse_pos_neg(m)
    m = PATTERN_PR.search(text)
    if m:
        out["pr_positive"] = _parse_pos_neg(m)
    m = PATTERN_HER2.search(text)
    if m:
        out["her2_positive"] = _parse_pos_neg(m)
    m = PATTERN_NODE.search(text)
    if m:
        out["node_positive"] = _parse_pos_neg(m)

    # ZIP (first 5-digit)
    m = PATTERN_ZIP.search(text)
    if m:
        out["zip_code"] = m.group(1)

    # Comorbidities
    if PATTERN_DIABETES.search(text):
        out["comorbidities"].append("diabetes")
    if PATTERN_CVD.search(text):
        out["comorbidities"].append("cardiovascular_disease")
    comorbid_block = PATTERN_COMORBID.search(text)
    if comorbid_block:
        block = comorbid_block.group(1)
        if "diabetes" in block.lower() and "diabetes" not in out["comorbidities"]:
            out["comorbidities"].append("diabetes")
        if any(x in block.lower() for x in ("heart", "cardiac", "hypertension", "cvd")) and "cardiovascular_disease" not in out["comorbidities"]:
            out["comorbidities"].append("cardiovascular_disease")

    return out


def parse_pdf_to_profile(file_bytes: bytes) -> Dict[str, Any]:
    """
    Read PDF, extract text from all pages, return structured patient profile dict.
    Caller must validate required fields (age, zip_code) and may fill defaults.
    """
    reader = PdfReader(io.BytesIO(file_bytes))
    text_parts = []
    for page in reader.pages:
        try:
            t = page.extract_text()
            if t:
                text_parts.append(t)
        except Exception:
            continue
    full_text = "\n".join(text_parts) if text_parts else ""
    return extract_patient_profile_from_text(full_text)
