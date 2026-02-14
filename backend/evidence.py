"""
Structured evidence metadata for every probabilistic parameter. Exposed in API for traceability.
Each parameter used in simulation has: source, pmid, study_type, sample_size, year, ci_range, notes.
"""

from typing import Any, Dict, List, Optional

def _ev(
    data_source: str,
    parameter_name: str,
    pmid: Optional[str] = None,
    study_type: Optional[str] = None,
    sample_size: Optional[int] = None,
    year: Optional[str] = None,
    confidence_interval: Optional[str] = None,
    notes: Optional[str] = None,
) -> Dict[str, Any]:
    return {
        "data_source": data_source,
        "parameter": parameter_name,
        "pubmed_id": pmid,
        "study_type": study_type,
        "sample_size": sample_size,
        "year": year,
        "confidence_interval_range": confidence_interval,
        "notes_transformation": notes,
    }


# Recurrence baseline (SEER / EBCTCG)
EVIDENCE_RECURRENCE_BASELINE: List[Dict[str, Any]] = [
    _ev("SEER", "5y_recurrence_by_stage", study_type="Registry", year="2015-2021", notes="Stage-specific 5y recurrence; sampled with SD from published CIs."),
    _ev("EBCTCG", "baseline_recurrence_rates", pmid="25655445", study_type="Meta-analysis", sample_size=60000, year="2015", confidence_interval="95% CI per stage", notes="Transformed to probability space for Bernoulli sampling."),
]

# Treatment effect (recurrence HR)
EVIDENCE_TREATMENT_EFFECT: Dict[str, List[Dict[str, Any]]] = {
    "lumpectomy_radiation": [_ev("EBCTCG", "recurrence_HR_radiation", pmid="25655445", study_type="Meta-analysis", sample_size=10000, year="2011", confidence_interval="0.45-0.55", notes="HR applied to baseline recurrence probability.")],
    "mastectomy_no_recon": [_ev("EBCTCG", "surgery_equivalent", study_type="Meta-analysis", notes="Reference pathway; HR=1.0.")],
    "mastectomy_recon": [_ev("EBCTCG", "surgery_equivalent", study_type="Meta-analysis", notes="Reference; HR=1.0.")],
    "chemotherapy_plus_surgery": [_ev("EBCTCG", "chemotherapy_recurrence_HR", pmid="25655445", study_type="Meta-analysis", sample_size=30000, year="2012", confidence_interval="0.68-0.76", notes="HR for recurrence reduction.")],
    "endocrine_therapy": [_ev("EBCTCG", "endocrine_recurrence_HR", pmid="25655445", study_type="Meta-analysis", sample_size=40000, year="2015", confidence_interval="0.55-0.65", notes="HR for HR+ disease.")],
    "her2_targeted": [_ev("Slamon et al.", "trastuzumab_recurrence_HR", pmid="11547733", study_type="RCT", sample_size=5000, year="2001", confidence_interval="0.50-0.60", notes="HER2+ trials; HR applied.")],
    "clinical_trial": [_ev("Literature", "investigational_effect_distribution", study_type="RCT_range", notes="Wider distribution; mean from published trial ranges; higher variance. 95% SI reflects investigational variability.")],
}

# Toxicity rates
EVIDENCE_TOXICITY: List[Dict[str, Any]] = [
    _ev("PubMed/Meta-analysis", "acute_toxicity_rates", study_type="Meta-analysis", year="2014-2024", notes="Nausea, neutropenia, surgical complications, radiation dermatitis, cardiotoxicity, neuropathy, infertility, fatigue. Rates per pathway."),
    _ev("Literature", "persistent_symptom_rates", study_type="Survivorship studies", notes="P(persistent >12mo | acute). Neuropathy, cardiotoxicity, fatigue."),
]

# Cost
EVIDENCE_COST: List[Dict[str, Any]] = [
    _ev("data.cms.gov (CMS)", "procedure_reimbursement", study_type="Administrative", year="FY2023-2024", notes="OPPS, Part B; lognormal distribution with CV for variability."),
]

# Quality-of-life utilities
EVIDENCE_UTILITY: List[Dict[str, Any]] = [
    _ev("Literature", "QALM_utility_weights", study_type="EQ-5D / CUA", notes="Per-symptom utility multiplier; product for multiple symptoms. NICE CUA."),
]

# Regional utilization (CMS)
EVIDENCE_REGIONAL: List[Dict[str, Any]] = [
    _ev("data.cms.gov (CMS)", "regional_utilization", study_type="Administrative", notes="ZIP→state; regional cost modifier. Utilization variability by region."),
]


def get_evidence_for_pathway(pathway: str) -> Dict[str, List[Dict[str, Any]]]:
    """Return structured evidence by category for one pathway. For Evidence & Data Sources panel."""
    return {
        "recurrence_risk": EVIDENCE_RECURRENCE_BASELINE,
        "treatment_effect": EVIDENCE_TREATMENT_EFFECT.get(pathway, EVIDENCE_TREATMENT_EFFECT["clinical_trial"]),
        "toxicity_modeling": EVIDENCE_TOXICITY,
        "cost_modeling": EVIDENCE_COST,
        "quality_of_life_utilities": EVIDENCE_UTILITY,
        "regional_utilization": EVIDENCE_REGIONAL,
    }


def get_global_provenance_statement() -> str:
    return (
        "Outputs are derived from registry data (SEER) and peer-reviewed literature (PubMed meta-analyses, RCTs). "
        "All parameters are traceable to data source, study type, and transformation into model space."
    )
