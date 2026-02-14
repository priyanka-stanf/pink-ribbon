"""
Backend-generated natural language outcome summary. No life expectancy; no medical advice.
Translates probabilities into clear language; compares pathways; highlights tradeoffs.
"""

from typing import Any, Dict, List


def _pathway_label(p: str) -> str:
    labels = {
        "lumpectomy_radiation": "lumpectomy plus radiation",
        "mastectomy_no_recon": "mastectomy without reconstruction",
        "mastectomy_recon": "mastectomy with reconstruction",
        "chemotherapy_plus_surgery": "chemotherapy plus surgery",
        "endocrine_therapy": "endocrine therapy",
        "her2_targeted": "HER2-targeted therapy",
        "clinical_trial": "clinical trial enrollment",
    }
    return labels.get(p, p.replace("_", " "))


def generate_narrative(
    age: int,
    stage: str,
    subtype: str,
    pathways: List[Dict[str, Any]],
) -> str:
    """Structured summary for pathway comparison. No life expectancy; no medical advice."""
    parts = []
    parts.append(
        f"For a {age}-year-old patient with {subtype} disease and stage {stage} at diagnosis, "
        "the following projections are based on a Monte Carlo simulation using registry and clinical trial data."
    )
    if not pathways:
        return " ".join(parts) + " No pathways were simulated for this profile."

    # Lead pathway (first or lowest recurrence)
    sorted_by_recurrence = sorted(pathways, key=lambda p: p.get("probability_recurrence_5y", 0))
    lead = sorted_by_recurrence[0]
    p_recur = lead["probability_recurrence_5y"] * 100
    si_lo = lead.get("probability_recurrence_5y_95_si_low", 0) * 100
    si_hi = lead.get("probability_recurrence_5y_95_si_high", 1) * 100
    parts.append(
        f"{_pathway_label(lead['pathway']).capitalize()} is associated with a {p_recur:.1f}% 5-year recurrence probability "
        f"(95% simulation interval {si_lo:.1f}%–{si_hi:.1f}%)."
    )

    # Compare to others
    for p in sorted_by_recurrence[1:4]:
        pr = p["probability_recurrence_5y"] * 100
        sym = p.get("expected_symptom_months_moderate_severe", 0)
        tox = p.get("probability_major_long_term_side_effect", 0) * 100
        cost_k = p.get("cost_distribution", {}).get("median", 0) / 1000
        label = _pathway_label(p["pathway"])
        comp = f"Compared to {label}, recurrence probability is {pr:.1f}%, with {sym:.0f} months of moderate or severe symptoms on average and {tox:.1f}% probability of a major long-term side effect (median cost ${cost_k:.0f}k)."
        parts.append(comp)

    if any(p["pathway"] == "clinical_trial" for p in pathways):
        parts.append(
            "The clinical trial pathway is modeled with higher uncertainty due to investigational treatment variability; 95% simulation intervals are wider."
        )

    parts.append(
        "This tool provides probabilistic projections based on public registry and clinical trial data. It does not replace clinical guidance."
    )
    return " ".join(parts)
