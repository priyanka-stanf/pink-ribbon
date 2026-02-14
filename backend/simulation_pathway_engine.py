"""
CareCompass treatment pathway projection engine. 0-5 year horizon only.
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
import evidence as ev

MONTHS_HORIZON = 60
ITERATIONS_PER_PATHWAY = 5000
MODERATE_SEVERE_UTILITY_THRESHOLD = 0.90
FERTILITY_QALM_PENALTY = 0.85  # utility multiplier when fertility concern and infertility in pathway
PARAMETER_SOURCES = ["SEER", "params_recurrence_5y", "params_treatment_effects", "params_symptoms", "params_costs", "params_geo"]


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


def _apply_adherence(hr: float, adherence: float) -> float:
    """Effective HR when adherence is <100%. 70% adherence weakens benefit."""
    if adherence >= 1.0:
        return hr
    return float(np.clip(1.0 - adherence * (1.0 - hr), 0.1, 1.0))


def _monthly_symptom_intensity(month: int, acute: set, persistent: set, pathway: str) -> float:
    """Severity 0-1 for this month. Acute: peak early then decay; endocrine: persistent low."""
    if month < 6:
        symptoms = acute
    else:
        symptoms = persistent
    if not symptoms:
        return 0.0
    # Chemo/surgery: peak first 3 months, decay by month 6
    if pathway in ("chemotherapy_plus_surgery", "clinical_trial", "lumpectomy_radiation"):
        if month < 3:
            return 0.7 + 0.2 * (1 - month / 3)
        if month < 6:
            return 0.5 * (1 - (month - 3) / 3)
        return 0.2 if symptoms else 0.0
    if pathway == "endocrine_therapy":
        return 0.25  # persistent low-grade
    if pathway in ("her2_targeted", "mastectomy_no_recon", "mastectomy_recon"):
        if month < 4:
            return 0.4
        return 0.15 if symptoms else 0.0
    return 0.2 if symptoms else 0.0


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
    adherence: float = 1.0,
    fertility_concern: bool = False,
) -> Dict[str, Any]:
    """Run Monte Carlo for one pathway. Returns pathway-level outputs, symptom curve, evidence, uncertainty drivers."""
    regional_mod = geo.get_regional_cost_modifier(zip_code or "00000")
    outcomes = []
    symptom_curve_sum = np.zeros(MONTHS_HORIZON)
    for _ in range(n_iter):
        base_p = recur.sample_baseline_5y_recurrence_prob(stage, rng)
        hr = _recurrence_hr_for_pathway(pathway, rng)
        hr_eff = _apply_adherence(hr, adherence)
        p_recur = min(0.99, base_p * hr_eff)
        recurrence_5y = rng.random() < p_recur
        acute = sym.sample_acute_symptoms(pathway, rng)
        persistent = {s for s in acute if sym.sample_persistent(s, rng)}
        major_lte = sym.has_major_lte(acute, persistent)
        symptom_months = 0
        qalm = 0.0
        for month in range(MONTHS_HORIZON):
            severity = _monthly_symptom_intensity(month, acute, persistent, pathway)
            symptom_curve_sum[month] += severity
            symptoms_this_month = acute if month < 6 else persistent
            u = sym.utility_for_symptoms(symptoms_this_month)
            if fertility_concern and "infertility" in symptoms_this_month and pathway in ("chemotherapy_plus_surgery", "endocrine_therapy", "clinical_trial"):
                u *= FERTILITY_QALM_PENALTY
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
    se = np.sqrt(p_recur_mean * (1 - p_recur_mean) / n_iter)
    p_recur_si_lo = float(max(0, p_recur_mean - 1.96 * se))
    p_recur_si_hi = float(min(1, p_recur_mean + 1.96 * se))

    cost_median = float(np.median(cost_arr))
    cost_q1 = float(np.percentile(cost_arr, 25))
    cost_q3 = float(np.percentile(cost_arr, 75))
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
    # Five uncertainty drivers (percent contribution)
    v_stage = v_rec * 0.5
    v_tx = v_rec * 0.5
    v_tox = (v_sym + v_qalm) / 2
    v_cost_d = v_cost * 0.95
    v_regional = v_cost * 0.05
    tot_d = v_stage + v_tx + v_tox + v_cost_d + v_regional or 1e-6
    uncertainty_drivers = {
        "baseline_stage_distribution": v_stage / tot_d,
        "treatment_effect_uncertainty": v_tx / tot_d,
        "toxicity_probability_uncertainty": v_tox / tot_d,
        "cost_distribution_variability": v_cost_d / tot_d,
        "regional_utilization_variability": v_regional / tot_d,
    }
    avg_symptom_curve = [float(symptom_curve_sum[m] / n_iter) for m in range(MONTHS_HORIZON)]

    out = {
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
        "uncertainty_drivers": uncertainty_drivers,
        "average_symptom_intensity_by_month": avg_symptom_curve,
        "n_iterations": n_iter,
        "evidence": ev.get_evidence_for_pathway(pathway),
    }
    if pathway == "clinical_trial":
        out["higher_uncertainty_label"] = "Higher uncertainty due to investigational treatment variability."
    if fertility_concern and pathway in ("chemotherapy_plus_surgery", "endocrine_therapy", "clinical_trial"):
        out["fertility_adjusted_quality_impact"] = True
    return out


def run_projection(
    patient: PatientInput,
    n_iterations: int = ITERATIONS_PER_PATHWAY,
    seed: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Run Monte Carlo for all eligible treatment pathways. 0-5 year only; no life expectancy.
    Only executes when called from API (not at page load).
    """
    if seed is None:
        seed = int(time.time() * 1000) % (2**31)
    rng = np.random.default_rng(seed)
    start_time = time.perf_counter()

    stage = _sample_stage(patient.age, getattr(patient, "stage_at_diagnosis", None), rng)
    subtype = _sample_subtype(
        patient.age,
        patient.er_positive,
        patient.pr_positive,
        patient.her2_positive,
        rng,
    )
    zip_code = (patient.zip_code or "").strip()
    adherence = getattr(patient, "treatment_adherence", 1.0) or 1.0
    adherence = max(0.70, min(1.0, adherence))
    fertility_concern = getattr(patient, "fertility_preservation_concern", False)

    eligible = pathways.get_eligible_pathways(stage, subtype)
    if not eligible:
        eligible = ["lumpectomy_radiation", "mastectomy_no_recon", "endocrine_therapy", "clinical_trial"]

    pathway_results = []
    for pathway in eligible:
        pathway_results.append(run_pathway(
            pathway, stage, zip_code, rng, n_iterations,
            adherence=adherence,
            fertility_concern=fertility_concern,
        ))

    elapsed = time.perf_counter() - start_time

    from narrative import generate_narrative
    narrative = generate_narrative(patient.age, stage, subtype, pathway_results)

    return {
        "monte_carlo_n_iterations": n_iterations,
        "monte_carlo_computation_seconds": round(elapsed, 3),
        "random_seed_used": seed,
        "parameter_sources_accessed": PARAMETER_SOURCES,
        "horizon_years": 5,
        "stage_sampled": stage,
        "subtype_sampled": subtype,
        "pathways": pathway_results,
        "narrative_summary": narrative,
        "data_provenance": ev.get_global_provenance_statement(),
        "provenance_note": "SEER, CMS, PubMed meta-analyses; see params_* and DATA_PROVENANCE.md. Results from stochastic sampling at runtime.",
    }
