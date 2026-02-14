"""
Hospital capability matching and composite scoring.

Scores hospitals on how likely they are to provide a specific treatment pathway
based on CMS-available fields: hospital type, oncology service flag, procedure volume.

NOTE: CMS does not contain direct "offers endocrine therapy" fields. We approximate
capability using hospital type (academic centers more likely for complex regimens,
clinical trials), oncology service indicator, and procedure volume as a proxy.
This is an approximation and the UI must state that hospital capability is inferred.
"""

from typing import Any, Dict, List

# ── Pathway → hospital type affinity ─────────────────────────────────────
# Higher score = hospital type is more likely to provide this pathway.
# Academic: broader capabilities, trials. Community: standard regimens.
# Based on literature on treatment patterns by hospital type.
PATHWAY_TYPE_AFFINITY: Dict[str, Dict[str, float]] = {
    "lumpectomy_radiation": {"academic": 0.9, "community": 0.85, "clinical_trial": 0.7},
    "mastectomy_no_recon": {"academic": 0.85, "community": 0.9, "clinical_trial": 0.6},
    "mastectomy_recon": {"academic": 0.9, "community": 0.6, "clinical_trial": 0.5},
    "chemotherapy_plus_surgery": {"academic": 0.9, "community": 0.75, "clinical_trial": 0.8},
    "endocrine_therapy": {"academic": 0.85, "community": 0.85, "clinical_trial": 0.7},
    "her2_targeted": {"academic": 0.95, "community": 0.6, "clinical_trial": 0.85},
    "clinical_trial": {"academic": 0.8, "community": 0.2, "clinical_trial": 1.0},
}

# Composite score weights
W_CAPABILITY = 0.45
W_QUALITY = 0.30
W_DISTANCE = 0.25

# Cost tier display mapping
COST_TIER_DISPLAY = {
    "green": {"symbol": "$", "label": "Lower cost (below CMS median)"},
    "yellow": {"symbol": "$$", "label": "Average cost (near CMS median)"},
    "red": {"symbol": "$$$", "label": "Higher cost (above CMS median)"},
}


def _capability_score(hospital: dict, pathway_key: str) -> float:
    """
    Score 0–1 for how likely this hospital can provide the pathway.
    Uses type affinity, oncology flag, and volume proxy.
    """
    htype = hospital.get("type", "community")
    affinity = PATHWAY_TYPE_AFFINITY.get(pathway_key, {}).get(htype, 0.5)

    # Oncology service bonus
    if hospital.get("has_oncology"):
        affinity = min(1.0, affinity + 0.05)
    else:
        affinity *= 0.6  # significant penalty if no oncology

    # Volume bonus (normalized: 500+ procedures = full bonus)
    volume = hospital.get("procedure_volume", 0)
    vol_bonus = min(volume / 500.0, 1.0) * 0.1
    affinity = min(1.0, affinity + vol_bonus)

    return round(affinity, 3)


def _quality_score(hospital: dict) -> float:
    """Normalize CMS quality rating to 0–1. Rating is 1–5; None → 0.5."""
    rating = hospital.get("quality_rating")
    if rating is None:
        return 0.5
    return round(min(max(rating / 5.0, 0.0), 1.0), 3)


def _distance_score(distance_miles: float, max_distance: float) -> float:
    """Closer = higher score. Linear decay."""
    if max_distance <= 0:
        return 1.0
    return round(max(0.0, 1.0 - distance_miles / max_distance), 3)


def score_and_rank_hospitals(
    hospitals: List[dict],
    recommended_pathway: str,
    max_results: int = 5,
) -> List[Dict[str, Any]]:
    """
    Score each hospital for the recommended pathway and return top N ranked.
    Composite = w_cap * capability + w_qual * quality + w_dist * distance.
    """
    if not hospitals:
        return []

    max_dist = max(h.get("distance_miles", 0) for h in hospitals) or 25.0

    scored: List[Dict[str, Any]] = []
    for h in hospitals:
        cap = _capability_score(h, recommended_pathway)
        qual = _quality_score(h)
        dist = _distance_score(h.get("distance_miles", 0), max_dist)
        composite = round(W_CAPABILITY * cap + W_QUALITY * qual + W_DISTANCE * dist, 4)

        cost_tier = h.get("cost_tier", "yellow")
        tier_info = COST_TIER_DISPLAY.get(cost_tier, COST_TIER_DISPLAY["yellow"])

        scored.append({
            "id": h["id"],
            "name": h["name"],
            "type": h["type"],
            "distance_miles": h.get("distance_miles", 0),
            "lat": h["lat"],
            "lon": h["lon"],
            "quality_rating": h.get("quality_rating"),
            "capability_score": cap,
            "composite_score": composite,
            "cost_tier": cost_tier,
            "cost_tier_symbol": tier_info["symbol"],
            "cost_tier_label": tier_info["label"],
            "has_oncology": h.get("has_oncology", False),
            # CMS Hospital Compare data fields
            "cms_overall_stars": h.get("cms_overall_stars"),
            "cms_mortality_rating": h.get("cms_mortality_rating", "Not available"),
            "cms_readmission_rating": h.get("cms_readmission_rating", "Not available"),
            "cms_patient_experience": h.get("cms_patient_experience", "Not available"),
            "cms_spending_per_beneficiary": h.get("cms_spending_per_beneficiary", "Not available"),
            "note": (
                "Hospital capability is inferred from public CMS data (type, oncology services, volume). "
                "This does not represent confirmed availability of this specific treatment."
            ),
        })

    scored.sort(key=lambda x: x["composite_score"], reverse=True)
    return scored[:max_results]
