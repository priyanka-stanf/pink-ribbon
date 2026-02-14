"""
Hospital-specific Monte Carlo simulation for the /analyze pipeline.

Profile + hospital dict → HospitalSimulationResult
Each iteration samples a pathway from the hospital's inferred treatment mix,
then runs recurrence / symptoms / QALM / cost for a 0–5 year horizon.
"""

import logging
import time
from typing import Any, Dict, List, Optional

import numpy as np

from models import (
    Hospital,
    HospitalSimulationResult,
    DistributionSummary,
    PatientProfile,
)
from simulation_pathway_engine import (
    MONTHS_HORIZON,
    _apply_adherence,
    _recurrence_hr_for_pathway,
    _sample_stage,
    _sample_subtype,
)
import params_recurrence_5y as recur
import params_symptoms as sym
import params_costs as costs
import params_geo as geo
from .hospital_treatment_mix import get_treatment_mix_for_hospital

logger = logging.getLogger("carecompass.simulation")

MODERATE_SEVERE_UTILITY_THRESHOLD = 0.90
FERTILITY_QALM_PENALTY = 0.85
MAJOR_LTE_SYMPTOMS = {"cardiotoxicity", "infertility", "neuropathy"}

# Map internal pathway keys → API-contract keys
_INTERNAL_TO_API: Dict[str, str] = {
    "chemotherapy_plus_surgery": "chemo_plus_surgery",
    "endocrine_therapy": "endocrine_only",
}


def _api_key(internal: str) -> str:
    return _INTERNAL_TO_API.get(internal, internal)


def _sample_pathway(mix: Dict[str, float], rng: np.random.Generator) -> str:
    pathways = list(mix.keys())
    probs = np.array([mix[p] for p in pathways])
    return pathways[int(rng.choice(len(pathways), p=probs))]


def _dist_summary(arr: np.ndarray, sample_n: int = 200) -> DistributionSummary:
    """Build a DistributionSummary with subsampled values for frontend plots."""
    idx = np.linspace(0, len(arr) - 1, min(sample_n, len(arr)), dtype=int)
    return DistributionSummary(
        values=[float(arr[i]) for i in idx],
        p5=float(np.percentile(arr, 5)),
        p25=float(np.percentile(arr, 25)),
        p50=float(np.percentile(arr, 50)),
        p75=float(np.percentile(arr, 75)),
        p95=float(np.percentile(arr, 95)),
        mean=float(np.mean(arr)),
        std=float(np.std(arr)),
    )


def run_hospital_simulation(
    profile: PatientProfile,
    hospital: dict,
    n_iterations: int = 2000,
    seed: Optional[int] = None,
) -> HospitalSimulationResult:
    """
    Run Monte Carlo for one hospital.
    Returns a HospitalSimulationResult with all required fields + distributions.
    """
    if seed is None:
        seed = int(time.time() * 1000) % (2**31)
    rng = np.random.default_rng(seed)
    start = time.perf_counter()

    # ── Map profile to engine inputs ──
    stage_input = profile.stage if profile.stage not in ("Unknown", "unknown") else None
    stage = _sample_stage(profile.age, stage_input, rng)
    subtype = _sample_subtype(
        profile.age,
        profile.er_status,
        profile.pr_status,
        profile.her2_status,
        rng,
    )

    # ── Infer treatment mix (internal keys) ──
    internal_mix = get_treatment_mix_for_hospital(hospital["type"], stage, subtype)
    api_mix = {_api_key(k): v for k, v in internal_mix.items()}
    logger.info(
        "  Treatment mix for %s (stage=%s, subtype=%s): %s",
        hospital["name"],
        stage,
        subtype,
        {k: round(v, 2) for k, v in api_mix.items()},
    )

    regional_mod = geo.get_regional_cost_modifier(profile.zip_code or "00000")

    # ── Monte Carlo ──
    rec_arr = np.empty(n_iterations)
    qalm_arr = np.empty(n_iterations)
    cost_arr = np.empty(n_iterations)
    sym_arr = np.empty(n_iterations)
    major_arr = np.empty(n_iterations)

    for i in range(n_iterations):
        pathway = _sample_pathway(internal_mix, rng)

        # Recurrence
        base_p = recur.sample_baseline_5y_recurrence_prob(stage, rng)
        hr = _recurrence_hr_for_pathway(pathway, rng)
        hr_eff = _apply_adherence(hr, 1.0)
        p_recur = min(0.99, base_p * hr_eff)
        recurrence = float(rng.random() < p_recur)

        # Symptoms
        acute = sym.sample_acute_symptoms(pathway, rng)
        persistent = {s for s in acute if sym.sample_persistent(s, rng)}
        major_lte = float(any(s in acute and s in persistent for s in MAJOR_LTE_SYMPTOMS))

        symptom_months = 0.0
        qalm = 0.0
        for month in range(MONTHS_HORIZON):
            symptoms_now = acute if month < 6 else persistent
            u = sym.utility_for_symptoms(symptoms_now)
            if profile.fertility_concern and "infertility" in symptoms_now:
                u *= FERTILITY_QALM_PENALTY
            qalm += u
            if u < MODERATE_SEVERE_UTILITY_THRESHOLD:
                symptom_months += 1.0

        cost = costs.sample_pathway_cost(pathway, rng, regional_mod)

        rec_arr[i] = recurrence
        qalm_arr[i] = qalm
        cost_arr[i] = cost
        sym_arr[i] = symptom_months
        major_arr[i] = major_lte

    # ── Aggregate statistics ──
    p_rec = float(np.mean(rec_arr))
    se_rec = np.sqrt(p_rec * (1.0 - p_rec) / max(n_iterations, 1))

    elapsed = time.perf_counter() - start

    return HospitalSimulationResult(
        hospital=Hospital(
            id=hospital["id"],
            name=hospital["name"],
            type=hospital["type"],
            distance_miles=hospital.get("distance_miles", 0.0),
            lat=hospital.get("lat", 0.0),
            lon=hospital.get("lon", 0.0),
        ),
        treatment_mix=api_mix,
        N_iterations=n_iterations,
        runtime_seconds=round(elapsed, 3),
        random_seed=seed,
        recurrence_5y_mean=round(p_rec, 5),
        recurrence_5y_ci_low=round(max(0.0, p_rec - 1.96 * se_rec), 5),
        recurrence_5y_ci_high=round(min(1.0, p_rec + 1.96 * se_rec), 5),
        symptom_months_mean=round(float(np.mean(sym_arr)), 2),
        qalm_mean=round(float(np.mean(qalm_arr)), 2),
        major_lte_prob=round(float(np.mean(major_arr)), 4),
        cost_median=round(float(np.median(cost_arr)), 0),
        cost_iqr=[
            round(float(np.percentile(cost_arr, 25)), 0),
            round(float(np.percentile(cost_arr, 75)), 0),
        ],
        recurrence_dist=_dist_summary(rec_arr),
        qalm_dist=_dist_summary(qalm_arr),
        cost_dist=_dist_summary(cost_arr),
        symptom_dist=_dist_summary(sym_arr),
        stage_used=stage,
        subtype_used=subtype,
    )
