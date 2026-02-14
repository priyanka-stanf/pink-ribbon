"""
CareCompass Monte Carlo treatment pathway engine. 0–5 year horizon only.
No life expectancy. Distribution-based HR sampling. Multi-objective utility ranking.

Pipeline per call:
  1. Resolve stage/subtype (sample from SEER if unknown)
  2. Determine eligible vs ineligible pathways (strict biomarker rules)
  3. For each eligible pathway, run N Monte Carlo iterations:
     a. Sample HR from CI-derived log-normal
     b. Compute 5y recurrence (Bernoulli)
     c. Sample symptom burden + QALM over 60 months
     d. Sample cost from CMS distributions
  4. SEER cross-validation check
  5. Compute utility scores and rank
  6. Return comprehensive results with auditability
"""

from __future__ import annotations

import logging
import time
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

from models import PatientInput
import params_seer as seer
import params_recurrence_5y as recur
import params_treatment_effects as tx
import params_symptoms as sym
import params_costs as costs
import params_pathways as pathways
import params_geo as geo

logger = logging.getLogger("carecompass.engine")

MONTHS_HORIZON = 60
ITERATIONS_PER_PATHWAY = 5000
MODERATE_SEVERE_UTILITY_THRESHOLD = 0.90
FERTILITY_QALM_PENALTY = 0.85
PARAMETER_SOURCES = ["SEER 18 2015-2021", "params_recurrence_5y", "params_treatment_effects (PubMed RCT/MA)", "params_symptoms (PubMed)", "params_costs (CMS)", "params_geo (Census/CMS)"]

# ── Utility ranking weights (configurable) ───────────────────────────────
# Ranking is based on clinical outcomes only: recurrence, quality of life, toxicity.
# Cost is NOT included in ranking — it is reported separately for financial planning
# after the best treatment is identified.
DEFAULT_UTILITY_WEIGHTS = {
    "w_recurrence": 0.50,
    "w_qalm": 0.30,
    "w_cost": 0.0,
    "w_toxicity": 0.20,
}

# ── SEER cross-validation threshold ─────────────────────────────────────
SEER_DEVIATION_THRESHOLD = 2.0  # flag if simulated mean deviates > 2 SD from SEER baseline


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


def _apply_adherence(hr: float, adherence: float) -> float:
    if adherence >= 1.0:
        return hr
    return float(np.clip(1.0 - adherence * (1.0 - hr), 0.1, 1.0))


def _get_ineligible_pathways(
    all_pathways: List[str],
    eligible: List[str],
    stage: str,
    subtype: str,
    er: Optional[bool],
    pr: Optional[bool],
    her2: Optional[bool],
) -> List[Dict[str, str]]:
    """Return list of ineligible pathways with reason."""
    ineligible = []
    for p in all_pathways:
        if p in eligible:
            continue
        if p == "endocrine_therapy":
            reason = "Endocrine therapy requires ER+ or PR+ status"
        elif p == "her2_targeted":
            reason = "HER2-targeted therapy requires HER2+ status"
        elif p == "lumpectomy_radiation" and stage in ("III", "IV"):
            reason = f"Lumpectomy + radiation not standard for stage {stage}"
        elif stage == "IV" and p in ("lumpectomy_radiation", "mastectomy_no_recon", "mastectomy_recon"):
            reason = f"Local surgery not standard first-line for metastatic (stage IV) disease"
        else:
            reason = f"Ineligible based on stage {stage} / subtype {subtype}"
        ineligible.append({"pathway": p, "eligible": False, "ineligible_reason": reason})
    return ineligible


def _seer_cross_validate(
    stage: str,
    pathway_key: str,
    simulated_recurrence_mean: float,
) -> Optional[str]:
    """
    Check if simulated recurrence deviates excessively from SEER baseline.
    Returns warning string if flagged, else None.
    """
    seer_mean = recur.SEER_5Y_RECURRENCE_BY_STAGE.get(stage, 0.15)
    seer_sd = recur.SEER_5Y_RECURRENCE_SD.get(stage, 0.03)
    deviation = abs(simulated_recurrence_mean - seer_mean)
    if seer_sd > 0 and deviation > SEER_DEVIATION_THRESHOLD * seer_sd:
        return (
            f"Simulated 5y recurrence ({simulated_recurrence_mean:.3f}) for {pathway_key} "
            f"deviates >{SEER_DEVIATION_THRESHOLD:.0f} SD from SEER baseline "
            f"({seer_mean:.3f} ± {seer_sd:.3f}) for stage {stage}. "
            f"Effect may reflect selective trial populations."
        )
    return None


def _min_max_norm(values: List[float], invert: bool = False) -> List[float]:
    """
    Min-max normalize across the pathway set.
    If invert=True, lower raw value → higher normalized (better).
    Returns 0.0 for all if no variance.
    """
    mn, mx = min(values), max(values)
    rng = mx - mn
    if rng < 1e-9:
        return [0.0] * len(values)
    if invert:
        return [(mx - v) / rng for v in values]
    return [(v - mn) / rng for v in values]


def _compute_utility_scores(
    pathway_results: List[Dict[str, Any]],
    weights: Dict[str, float],
) -> None:
    """
    Multi-objective utility with within-set normalization.
    Each dimension is min-max normalized across eligible pathways so that
    no single dimension dominates due to scale differences.
    Higher utility = better.

    Ranking dimensions (clinical outcomes only):
      recurrence  — lower is better  (inverted)
      QALM        — higher is better
      toxicity    — lower is better  (inverted)

    Cost is NOT included in ranking (w_cost=0 by default).
    Cost is reported separately for post-treatment financial planning.
    """
    if not pathway_results:
        return

    recs = [r["probability_recurrence_5y"] for r in pathway_results]
    qalms = [r["mean_quality_adjusted_months_5y"] for r in pathway_results]
    toxes = [r["probability_major_long_term_side_effect"] for r in pathway_results]

    norm_rec = _min_max_norm(recs, invert=True)       # lower recurrence → 1.0
    norm_qalm = _min_max_norm(qalms, invert=False)    # higher QALM → 1.0
    norm_tox = _min_max_norm(toxes, invert=True)       # lower toxicity → 1.0

    w = weights
    for i, r in enumerate(pathway_results):
        score = (
            w["w_recurrence"] * norm_rec[i]
            + w["w_qalm"] * norm_qalm[i]
            + w["w_toxicity"] * norm_tox[i]
        )
        # Only include cost if explicitly weighted (not default)
        if w.get("w_cost", 0) > 0:
            costs_list = [r2["cost_distribution"]["median"] for r2 in pathway_results]
            norm_cost = _min_max_norm(costs_list, invert=True)
            score += w["w_cost"] * norm_cost[i]
        r["utility_score"] = round(float(score), 5)


CONVERGENCE_NUM_CHECKPOINTS = 5  # report running mean at N/5, 2N/5, … , N
BATCH_SIZE_FOR_PROPORTION_CI = 50  # split N into batches for empirical CI of proportion


def _empirical_proportion_ci(
    binary_arr: np.ndarray, n_batches: int = BATCH_SIZE_FOR_PROPORTION_CI,
) -> Tuple[float, float]:
    """
    Empirical 95% CI for a proportion from binary MC outcomes.
    Split samples into batches, compute per-batch proportion,
    take 2.5th / 97.5th percentile of batch proportions.
    For binary data, straight percentiles of 0/1 are meaningless (always 0 and 1),
    so batch-mean approach is the standard MC diagnostic.
    """
    n = len(binary_arr)
    if n < n_batches * 2:
        n_batches = max(2, n // 10)
    batch_size = n // n_batches
    if batch_size < 1:
        p = float(np.mean(binary_arr))
        return (p, p)
    batch_means = np.array([
        float(np.mean(binary_arr[i * batch_size : (i + 1) * batch_size]))
        for i in range(n_batches)
    ])
    return (
        float(np.percentile(batch_means, 2.5)),
        float(np.percentile(batch_means, 97.5)),
    )


def _convergence_checkpoints(arr: np.ndarray, num_ck: int = CONVERGENCE_NUM_CHECKPOINTS) -> List[Dict[str, Any]]:
    """
    Compute running mean of an array at evenly-spaced checkpoints.
    Returns list of {k, running_mean} dicts.
    """
    n = len(arr)
    step = max(1, n // num_ck)
    checkpoints: List[Dict[str, Any]] = []
    for i in range(1, num_ck + 1):
        k = min(i * step, n)
        checkpoints.append({
            "k": int(k),
            "recurrence_running_mean": round(float(np.mean(arr[:k])), 6),
        })
    return checkpoints


def run_pathway(
    pathway: str,
    stage: str,
    zip_code: str,
    rng: np.random.Generator,
    n_iter: int = ITERATIONS_PER_PATHWAY,
    adherence: float = 1.0,
    fertility_concern: bool = False,
) -> Dict[str, Any]:
    """
    Run Monte Carlo for one pathway with distribution-based HR sampling.

    Every iteration draws stochastic samples:
      1. HR ~ LogNormal(log_mean, log_sd)        [parameter uncertainty]
      2. baseline_p ~ Normal(seer_mean, seer_sd)  [parameter uncertainty]
      3. recurrence = Bernoulli(baseline_p × HR)   [patient-level randomness]
      4. Per-symptom acute occurrence = Bernoulli   [patient-level]
      5. Per-symptom persistence = Bernoulli        [patient-level]
      6. Per-procedure cost ~ LogNormal(mu, sigma)  [cost variability]

    Returns pathway-level outputs with:
      - Empirical quantile intervals (2.5th / 97.5th) for all key outputs
      - Convergence checkpoints (running mean at N/5 intervals)
      - Sample size counts (recurrence events, toxicity events)
      - Proof-of-MC metadata block
    """
    pathway_start = time.perf_counter()
    regional_mod = geo.get_regional_cost_modifier(zip_code or "00000")

    # ── Pre-allocate result arrays (length = n_iter) ──
    rec_arr = np.empty(n_iter)
    sym_arr = np.empty(n_iter)
    qalm_arr = np.empty(n_iter)
    cost_arr = np.empty(n_iter)
    major_arr = np.empty(n_iter)

    # ── Stochastic simulation loop ──
    for i in range(n_iter):
        # LAYER 1 — Parameter uncertainty: sample HR from CI-derived log-normal
        hr = tx.sample_recurrence_hr(pathway, rng)
        hr_eff = _apply_adherence(hr, adherence)

        # LAYER 1 — Parameter uncertainty: sample baseline recurrence from SEER distribution
        base_p = recur.sample_baseline_5y_recurrence_prob(stage, rng)

        # LAYER 2 — Patient-level randomness: Bernoulli draw for 5y recurrence
        p_recur = min(0.99, base_p * hr_eff)
        recurrence_5y = float(rng.random() < p_recur)

        # LAYER 2 — Patient-level randomness: per-symptom Bernoulli draws
        acute = sym.sample_acute_symptoms(pathway, rng)
        persistent = {s for s in acute if sym.sample_persistent(s, rng)}
        major_lte = float(sym.has_major_lte(acute, persistent))

        # QoL trajectory over 60 months
        symptom_months = 0.0
        qalm = 0.0
        for month in range(MONTHS_HORIZON):
            symptoms_now = acute if month < 6 else persistent
            u = sym.utility_for_symptoms(symptoms_now)
            if fertility_concern and "infertility" in symptoms_now and pathway in (
                "chemotherapy_plus_surgery", "endocrine_therapy", "clinical_trial"
            ):
                u *= FERTILITY_QALM_PENALTY
            qalm += u
            if u < MODERATE_SEVERE_UTILITY_THRESHOLD:
                symptom_months += 1.0

        # LAYER 2 — Cost variability: per-procedure log-normal draws
        cost_val = costs.sample_pathway_cost(pathway, rng, regional_mod)

        rec_arr[i] = recurrence_5y
        sym_arr[i] = symptom_months
        qalm_arr[i] = qalm
        cost_arr[i] = cost_val
        major_arr[i] = major_lte

    pathway_elapsed = time.perf_counter() - pathway_start

    # ── Aggregation: all from simulated arrays, no deterministic formulas ──
    p_rec_mean = float(np.mean(rec_arr))
    recurrence_event_count = int(np.sum(rec_arr))
    toxicity_event_count = int(np.sum(major_arr))

    # Empirical 95% interval for recurrence proportion (batch-mean method)
    p_rec_si_lo, p_rec_si_hi = _empirical_proportion_ci(rec_arr)

    # Empirical percentiles for continuous outputs
    qalm_mean = float(np.mean(qalm_arr))
    qalm_p2_5 = float(np.percentile(qalm_arr, 2.5))
    qalm_p97_5 = float(np.percentile(qalm_arr, 97.5))

    sym_mean = float(np.mean(sym_arr))
    sym_p2_5 = float(np.percentile(sym_arr, 2.5))
    sym_p97_5 = float(np.percentile(sym_arr, 97.5))

    cost_median = float(np.median(cost_arr))
    cost_q1 = float(np.percentile(cost_arr, 25))
    cost_q3 = float(np.percentile(cost_arr, 75))
    cost_p2_5 = float(np.percentile(cost_arr, 2.5))
    cost_p97_5 = float(np.percentile(cost_arr, 97.5))

    # Variance contribution diagnostics
    v_rec = float(np.var(rec_arr))
    v_cost = float(np.var(cost_arr) / 1e10)
    v_sym = float(np.var(sym_arr) / 100)
    v_qalm = float(np.var(qalm_arr) / 100)
    total_var = v_rec + v_cost + v_sym + v_qalm or 1e-6

    # Convergence checkpoints: running mean of recurrence at N/5 intervals
    convergence_ck = _convergence_checkpoints(rec_arr)

    # SEER cross-validation
    seer_warning = _seer_cross_validate(stage, pathway, p_rec_mean)

    result: Dict[str, Any] = {
        "pathway": pathway,
        "eligible": True,
        # ── Recurrence ──
        "probability_recurrence_5y": round(p_rec_mean, 5),
        "probability_recurrence_5y_95_si_low": round(p_rec_si_lo, 5),
        "probability_recurrence_5y_95_si_high": round(p_rec_si_hi, 5),
        # ── Cost (all from empirical distribution) ──
        "cost_distribution": {
            "median": round(cost_median, 0),
            "q1": round(cost_q1, 0),
            "q3": round(cost_q3, 0),
            "iqr": round(cost_q3 - cost_q1, 0),
            "p2_5": round(cost_p2_5, 0),
            "p97_5": round(cost_p97_5, 0),
        },
        # ── Symptom burden (mean + empirical 95% interval) ──
        "expected_symptom_months_moderate_severe": round(sym_mean, 2),
        "symptom_months_95_si": [round(sym_p2_5, 2), round(sym_p97_5, 2)],
        # ── QALM (mean + empirical 95% interval) ──
        "mean_quality_adjusted_months_5y": round(qalm_mean, 2),
        "qalm_95_si": [round(qalm_p2_5, 2), round(qalm_p97_5, 2)],
        # ── Toxicity ──
        "probability_major_long_term_side_effect": round(float(np.mean(major_arr)), 4),
        # ── Diagnostics ──
        "variance_contribution": {
            "recurrence": round(v_rec / total_var, 3),
            "cost": round(v_cost / total_var, 3),
            "symptom_months": round(v_sym / total_var, 3),
            "qalm": round(v_qalm / total_var, 3),
        },
        "n_iterations": n_iter,
        "provenance": tx.get_pathway_provenance(pathway),
        # ── Proof-of-Monte-Carlo metadata ──
        "mc_proof": {
            "N": n_iter,
            "runtime_seconds": round(pathway_elapsed, 4),
            "convergence_checkpoints": convergence_ck,
            "sample_sizes": {
                "recurrence_events": recurrence_event_count,
                "toxicity_events": toxicity_event_count,
                "total_iterations": n_iter,
            },
            "interval_method": "empirical_quantiles",
            "recurrence_interval_method": "batch_mean_empirical_percentile (50 batches, 2.5th/97.5th)",
            "parameter_uncertainty": "HR sampled from log-normal(log_mean, log_sd) per iteration; baseline recurrence sampled from Normal(seer_mean, seer_sd) per iteration",
            "patient_level_randomness": "Bernoulli(p_recur) for recurrence; per-symptom Bernoulli for toxicity; LogNormal per cost component",
        },
    }

    if seer_warning:
        result["seer_cross_validation_warning"] = seer_warning

    if pathway == "clinical_trial":
        result["higher_uncertainty_label"] = (
            "Higher uncertainty due to investigational treatment variability. "
            "CI intentionally wider than other pathways."
        )

    if fertility_concern and pathway in ("chemotherapy_plus_surgery", "endocrine_therapy", "clinical_trial"):
        result["fertility_adjusted_quality_impact"] = True

    return result


def run_projection(
    patient: PatientInput,
    n_iterations: int = ITERATIONS_PER_PATHWAY,
    seed: Optional[int] = None,
    utility_weights: Optional[Dict[str, float]] = None,
) -> Dict[str, Any]:
    """
    Full Monte Carlo projection with utility ranking.
    Returns eligible + ineligible pathways, recommended plan, auditability metadata.
    """
    if seed is None:
        seed = int(time.time() * 1000) % (2**31)
    rng = np.random.default_rng(seed)
    start_time = time.perf_counter()
    weights = utility_weights or DEFAULT_UTILITY_WEIGHTS

    # ── Resolve patient parameters ──
    stage = _sample_stage(patient.age, getattr(patient, "stage_at_diagnosis", None), rng)
    subtype = _sample_subtype(
        patient.age, patient.er_positive, patient.pr_positive, patient.her2_positive, rng,
    )
    zip_code = (patient.zip_code or "").strip()
    adherence = getattr(patient, "treatment_adherence", 1.0) or 1.0
    adherence = max(0.70, min(1.0, adherence))
    fertility_concern = getattr(patient, "fertility_preservation_concern", False)

    logger.info("Engine: age=%d, stage=%s, subtype=%s, zip=%s", patient.age, stage, subtype, zip_code)

    # ── Eligible vs ineligible pathways ──
    all_pathway_keys = pathways.PATHWAY_KEYS
    eligible = pathways.get_eligible_pathways(stage, subtype)
    if not eligible:
        eligible = ["lumpectomy_radiation", "mastectomy_no_recon", "endocrine_therapy", "clinical_trial"]

    ineligible_list = _get_ineligible_pathways(
        all_pathway_keys, eligible, stage, subtype,
        patient.er_positive, patient.pr_positive, patient.her2_positive,
    )

    logger.info("Eligible: %s | Ineligible: %d pathways", eligible, len(ineligible_list))

    # ── Run Monte Carlo per eligible pathway ──
    pathway_results: List[Dict[str, Any]] = []
    for pw in eligible:
        logger.info("  Running %d iterations for %s…", n_iterations, pw)
        result = run_pathway(
            pw, stage, zip_code, rng, n_iterations,
            adherence=adherence, fertility_concern=fertility_concern,
        )
        pathway_results.append(result)

    # ── Utility scoring and ranking (within-set normalization) ──
    if pathway_results:
        _compute_utility_scores(pathway_results, weights)
        pathway_results.sort(key=lambda x: x["utility_score"], reverse=True)
        best = pathway_results[0]
        recommended = {
            "pathway_key": best["pathway"],
            "utility_score": best["utility_score"],
            "explanation": (
                f"'{best['pathway']}' ranks highest based on clinical outcomes "
                f"(recurrence weight={weights['w_recurrence']}, QoL={weights['w_qalm']}, "
                f"toxicity={weights['w_toxicity']}). "
                f"5y recurrence: {best['probability_recurrence_5y']*100:.1f}% "
                f"[{best['probability_recurrence_5y_95_si_low']*100:.1f}–"
                f"{best['probability_recurrence_5y_95_si_high']*100:.1f}%], "
                f"QALM: {best['mean_quality_adjusted_months_5y']:.1f} months. "
                f"Cost is not factored into ranking — see cost column for financial planning."
            ),
            "disclaimer": (
                "This is the best plan based on clinical outcomes and is NOT medical advice. "
                "Actual treatment decisions must involve a clinical care team. "
                "Results are probabilistic projections, not predictions."
            ),
        }
    else:
        recommended = {"pathway_key": None, "explanation": "No eligible pathways.", "disclaimer": ""}

    elapsed = time.perf_counter() - start_time

    return {
        "monte_carlo": {
            "n_iterations": n_iterations,
            "runtime_seconds": round(elapsed, 3),
            "random_seed": seed,
        },
        "patient_summary": {
            "age": patient.age,
            "stage_used": stage,
            "subtype_used": subtype,
            "zip_code": zip_code,
        },
        "utility_weights": weights,
        "pathways": pathway_results + ineligible_list,
        "recommended_plan": recommended,
        "provenance": {
            "seer_version": "SEER 18 registries, 2015-2021",
            "pmids_used": tx.get_all_pmids(),
            "cms_dataset": "CMS FY2023-2024 OPPS/Part B reimbursement",
            "parameter_sources": PARAMETER_SOURCES,
            "horizon": "0-5 years",
            "disclaimer": (
                "Projections are stochastic Monte Carlo estimates using public data. "
                "0–5 year horizon only; no life expectancy modeled. "
                "Treatment patterns are proxies, not tumor board decisions."
            ),
        },
    }
