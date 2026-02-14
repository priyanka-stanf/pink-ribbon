"""
Inferred treatment pathway weights by hospital type (academic vs community).
Based on hospital type and regional patterns; not actual tumor board behavior.
Used to weight Monte Carlo pathway sampling per hospital.
"""
from typing import Dict, List

from params_pathways import PATHWAY_KEYS, get_eligible_pathways

# Weights by hospital type (approximate frequency). Sum to 1 over all pathways.
# Source: literature on academic vs community treatment patterns; CMS/utilization patterns.
# Do not claim precise tumor board behavior.
ACADEMIC_WEIGHTS: Dict[str, float] = {
    "lumpectomy_radiation": 0.28,
    "mastectomy_no_recon": 0.12,
    "mastectomy_recon": 0.18,
    "chemotherapy_plus_surgery": 0.18,
    "endocrine_therapy": 0.10,
    "her2_targeted": 0.08,
    "clinical_trial": 0.06,
}
COMMUNITY_WEIGHTS: Dict[str, float] = {
    "lumpectomy_radiation": 0.32,
    "mastectomy_no_recon": 0.18,
    "mastectomy_recon": 0.22,
    "chemotherapy_plus_surgery": 0.14,
    "endocrine_therapy": 0.08,
    "her2_targeted": 0.04,
    "clinical_trial": 0.02,
}
# Clinical trial sites: higher weight on clinical_trial pathway; rest from academic-style mix.
CLINICAL_TRIAL_WEIGHTS: Dict[str, float] = {
    "lumpectomy_radiation": 0.18,
    "mastectomy_no_recon": 0.08,
    "mastectomy_recon": 0.12,
    "chemotherapy_plus_surgery": 0.15,
    "endocrine_therapy": 0.08,
    "her2_targeted": 0.07,
    "clinical_trial": 0.32,
}


def get_treatment_mix_for_hospital(
    hospital_type: str,
    stage: str,
    subtype: str,
) -> Dict[str, float]:
    """
    Return pathway -> weight for this hospital type and patient (stage/subtype).
    Only eligible pathways get non-zero weight; weights normalized to sum to 1.
    """
    eligible = get_eligible_pathways(stage, subtype)
    if not eligible:
        eligible = ["lumpectomy_radiation", "mastectomy_no_recon", "endocrine_therapy", "clinical_trial"]
    ht = (hospital_type or "").lower()
    if ht == "academic":
        base = ACADEMIC_WEIGHTS
    elif ht == "clinical_trial":
        base = CLINICAL_TRIAL_WEIGHTS
    else:
        base = COMMUNITY_WEIGHTS
    # Restrict to eligible and renormalize
    subset = {p: base.get(p, 0.0) for p in eligible if base.get(p, 0.0) > 0}
    if not subset:
        subset = {p: 1.0 / len(eligible) for p in eligible}
    total = sum(subset.values()) or 1.0
    return {p: w / total for p, w in subset.items()}


def get_pathway_list() -> List[str]:
    return list(PATHWAY_KEYS)
