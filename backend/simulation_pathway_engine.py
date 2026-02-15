"""
PinkRibbon treatment pathway projection engine. 0-5 year horizon only.
No life expectancy. Monte Carlo per pathway: recurrence, symptom burden, QALM, cost.
Provenance: SEER, CMS, PubMed. Simulation runs only on API request; not at page load.
"""

from __future__ import annotations

import time
import numpy as np
from typing import Any, Dict, List, Optional, Tuple

from models import PatientInput
import params_seer as seer
import params_recurrence_5y as recur
import params_treatment_effects as tx
import params_symptoms as sym
import params_costs as costs
import params_pathways as pathways
import params_geo as geo

MONTHS_HORIZON = 60
ITERATIONS_PER_PATHWAY = 5000
MODERATE_SEVERE_UTILITY_THRESHOLD = 0.90  # months with utility below this count as moderate/severe symptom months


def _sample_stage(age: int, stage_given: Optional[str], rng: np.random.Generator) -> str:
    if stage_given and str(stage_given) != "unknown":
        return str(stage_given)
    dist = seer.get_stage_distribution(age)
    return ["I", "II", "III", "IV"][int(rng.choice(4, p=dist))]


def _sample_subtype(
    age: int,
    er: Optional[bool],
    pr: Optional[bool],
    her2: Optional[bool],
    rng: np.random.Generator,
) -> str:
    if er is not None and pr is not None and her2 is not None:
        if her2:
            return "HER2+"
        if er or pr:
            return "HR+"
        return "TNBC"
    dist = seer.get_subtype_distribution(age)
    return ["HR+", "HER2+", "TNBC"][int(rng.choice(3, p=dist))]


def _recurrence_hr_for_pathway(pathway: str, rng: np.random.Generator) -> float:
    if pathway == "clinical_trial":
        return tx.sample_clinical_trial_hr(rng)
    return tx.get_recurrence_hr(pathway)


def _run_one_iteration(
    pathway: str,
    stage: str,
    rng: np.random.Generator,
) -> Dict[str, Any]:
    """Single iteration for one pathway. Returns recurrence_5y, symptom_months, qalm_60, cost, major_lte."""
    # Baseline 5y recurrence from SEER; apply pathway HR
    base_p = recur.sample_baseline_5y_recurrence_prob(stage, rng)
    hr = _recurrence_hr_for_pathway(pathway, rng)
    p_recur = min(0.99, base_p * hr)
    recurrence_5y = rng.random() < p_recur

    # Acute symptoms
    acute = sym.sample_acute_symptoms(pathway, rng)
    persistent = {s for s in acute if sym.sample_persistent(s, rng)}
    major_lte = sym.has_major_lte(acute, persistent)

    # Months 0-59: acute in first 6 months, persistent for rest if applicable. Simplify: acute affects first 6 mo, persistent affects months 6-60.
    symptom_months = 0
    qalm = 0.0
    for month in range(MONTHS_HORIZON):
        if month < 6:
            symptoms_this_month = acute
        else:
            symptoms_this_month = persistent
        u = sym.utility_for_symptoms(symptoms_this_month)
        qalm += u
        if u < MODERATE_SEVERE_UTILITY_THRESHOLD:
            symptom_months += 1

    # Cost from distribution
    regional_mod = geo.get_regional_cost_modifier("")  # zip passed at caller level
    cost = costs.sample_pathway_cost(pathway, rng, regional_mod)

    return {
        "recurrence_5y": recurrence_5y,
        "symptom_months": symptom_months,
        "qalm_60": qalm,
        "cost": cost,
        "major_lte": major_lte,
    }


def _variance_contribution(
    results: List[Dict[str, Any]],
    key: str,
) -> float:
    """Contribution of this outcome key to total variance (normalized)."""
    arr = np.array([r[key] for r in results])
    return float(np.var(arr))


def run_pathway(
    pathway: str,
    stage: str,
    zip_code: str,
    rng: np.random.Generator,
    n_iter: int = ITERATIONS_PER_PATHWAY,
) -> Dict[str, Any]:
    """Run Monte Carlo for one pathway. Returns pathway-level outputs with 95% SI and distributions."""
    regional_mod = geo.get_regional_cost_modifier(zip_code or "00000")
    outcomes = []
    for _ in range(n_iter):
        # Re-run logic with zip for cost
        base_p = recur.sample_baseline_5y_recurrence_prob(stage, rng)
        hr = _recurrence_hr_for_pathway(pathway, rng)
        p_recur = min(0.99, base_p * hr)
        recurrence_5y = rng.random() < p_recur
        acute = sym.sample_acute_symptoms(pathway, rng)
        persistent = {s for s in acute if sym.sample_persistent(s, rng)}
        major_lte = sym.has_major_lte(acute, persistent)
        symptom_months = 0
        qalm = 0.0
        for month in range(MONTHS_HORIZON):
            symptoms_this_month = acute if month < 6 else persistent
            u = sym.utility_for_symptoms(symptoms_this_month)
            qalm += u
            if u < MODERATE_SEVERE_UTILITY_THRESHOLD:
                symptom_months += 1
        cost = costs.sample_pathway_cost(pathway, rng, regional_mod)
        outcomes.append({
            "recurrence_5y": recurrence_5y,
            "symptom_months": symptom_months,
            "qalm_60": qalm,
            "cost": cost,
            "major_lte": major_lte,
        })

    rec = np.array([o["recurrence_5y"] for o in outcomes])
    cost_arr = np.array([o["cost"] for o in outcomes])
    sym_arr = np.array([o["symptom_months"] for o in outcomes])
    qalm_arr = np.array([o["qalm_60"] for o in outcomes])
    major_arr = np.array([o["major_lte"] for o in outcomes])

    p_recur_mean = float(np.mean(rec))
    # 95% simulation interval (approximate normal for proportion)
    se = np.sqrt(p_recur_mean * (1 - p_recur_mean) / n_iter)
    p_recur_si_lo = float(max(0, p_recur_mean - 1.96 * se))
    p_recur_si_hi = float(min(1, p_recur_mean + 1.96 * se))

    cost_median = float(np.median(cost_arr))
    cost_q1 = float(np.percentile(cost_arr, 25))
    cost_q3 = float(np.percentile(cost_arr, 75))
    total_var = np.var(rec) + np.var(cost_arr) / 1e10 + np.var(sym_arr) / 100 + np.var(qalm_arr) / 100
    v_rec = np.var(rec)
    v_cost = np.var(cost_arr) / 1e10
    v_sym = np.var(sym_arr) / 100
    v_qalm = np.var(qalm_arr) / 100
    total_var = v_rec + v_cost + v_sym + v_qalm or 1e-6
    contrib = {
        "recurrence": v_rec / total_var,
        "cost": v_cost / total_var,
        "symptom_months": v_sym / total_var,
        "qalm": v_qalm / total_var,
    }

    return {
        "pathway": pathway,
        "probability_recurrence_5y": p_recur_mean,
        "probability_recurrence_5y_95_si_low": p_recur_si_lo,
        "probability_recurrence_5y_95_si_high": p_recur_si_hi,
        "cost_distribution": {
            "median": cost_median,
            "q1": cost_q1,
            "q3": cost_q3,
            "iqr": cost_q3 - cost_q1,
        },
        "expected_symptom_months_moderate_severe": float(np.mean(sym_arr)),
        "mean_quality_adjusted_months_5y": float(np.mean(qalm_arr)),
        "probability_major_long_term_side_effect": float(np.mean(major_arr)),
        "variance_contribution": contrib,
        "n_iterations": n_iter,
    }


def run_projection(
    patient: PatientInput,
    n_iterations: int = ITERATIONS_PER_PATHWAY,
    seed: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Run Monte Carlo for all eligible treatment pathways. 0-5 year only; no life expectancy.
    Only executes when called from API (not at page load).
    """
    rng = np.random.default_rng(seed)
    start_time = time.perf_counter()

    # Resolve stage and subtype (sample if unknown)
    stage = _sample_stage(patient.age, getattr(patient, "stage_at_diagnosis", None), rng)
    subtype = _sample_subtype(
        patient.age,
        patient.er_positive,
        patient.pr_positive,
        patient.her2_positive,
        rng,
    )
    zip_code = (patient.zip_code or "").strip()

    eligible = pathways.get_eligible_pathways(stage, subtype)
    if not eligible:
        eligible = ["lumpectomy_radiation", "mastectomy_no_recon", "endocrine_therapy", "clinical_trial"]

    pathway_results = []
    for pathway in eligible:
        pathway_results.append(run_pathway(pathway, stage, zip_code, rng, n_iterations))

    elapsed = time.perf_counter() - start_time

    return {
        "monte_carlo_n_iterations": n_iterations,
        "monte_carlo_computation_seconds": round(elapsed, 3),
        "horizon_years": 5,
        "stage_sampled": stage,
        "subtype_sampled": subtype,
        "pathways": pathway_results,
        "data_provenance": "SEER, CMS, PubMed meta-analyses; see params_* and DATA_PROVENANCE.md. Results from stochastic sampling at runtime.",
    }
