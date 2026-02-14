"""
CareCompass API — single-pass pipeline.

POST /analyze: PatientProfile in → HospitalSimulationResult[] out.
Pipeline: (1) ZIP→lat/lon, (2) find hospitals, (3) infer treatment mix,
(4) Monte Carlo per hospital, (5) return results.

0–5 year horizon. No life expectancy. No paid APIs.
"""

import logging
import time
from typing import Any, Dict, List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import PatientProfile, HospitalSimulationResult
from services.hospital_service import zip_to_latlon, find_hospitals_near_zip
from services.simulation_service import run_hospital_simulation

logger = logging.getLogger("carecompass")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s  %(message)s",
)

app = FastAPI(
    title="CareCompass",
    description="Single-pass breast cancer treatment simulator. POST /analyze.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Configuration ──────────────────────────────────────────────────────────
SEARCH_RADIUS_MILES = 50.0
MAX_HOSPITALS = 5
MC_ITERATIONS = 2000  # balance speed vs accuracy; reported in response


@app.get("/health")
def health():
    return {"status": "ok", "service": "CareCompass"}


@app.post("/analyze")
def analyze(profile: PatientProfile) -> Dict[str, Any]:
    """
    Single-pass pipeline. Accepts PatientProfile, returns
    { results: HospitalSimulationResult[], patient_summary: {...} }.
    """
    pipeline_start = time.perf_counter()

    # ── Step 1: ZIP → lat/lon ──────────────────────────────────────────
    logger.info("PIPELINE Step 1: Converting ZIP %s to lat/lon", profile.zip_code)
    coords = zip_to_latlon(profile.zip_code)
    if coords is None:
        logger.warning("ZIP %s not found in local dataset", profile.zip_code)
        return {
            "results": [],
            "patient_summary": profile.dict(),
            "message": f"ZIP {profile.zip_code} not found in local dataset.",
        }
    lat, lon = coords
    logger.info("  → lat=%.4f, lon=%.4f", lat, lon)

    # ── Step 2: Find hospitals within radius ───────────────────────────
    logger.info(
        "PIPELINE Step 2: Finding hospitals within %.0f miles of (%s)",
        SEARCH_RADIUS_MILES,
        profile.zip_code,
    )
    hospitals = find_hospitals_near_zip(
        profile.zip_code,
        radius_miles=SEARCH_RADIUS_MILES,
        max_results=MAX_HOSPITALS,
    )
    if not hospitals:
        logger.warning("No hospitals found within %.0f mi of ZIP %s", SEARCH_RADIUS_MILES, profile.zip_code)
        return {
            "results": [],
            "patient_summary": profile.dict(),
            "message": f"No hospitals found within {SEARCH_RADIUS_MILES:.0f} miles of ZIP {profile.zip_code}.",
        }
    logger.info("  → Found %d hospital(s)", len(hospitals))

    # ── Steps 3–4: Per-hospital treatment mix + Monte Carlo ────────────
    results: List[Dict[str, Any]] = []
    for h in hospitals:
        logger.info(
            "PIPELINE Step 3→4: Hospital '%s' (%s) — inferring mix & running %d-iteration Monte Carlo",
            h["name"],
            h["type"],
            MC_ITERATIONS,
        )
        sim = run_hospital_simulation(profile, h, n_iterations=MC_ITERATIONS)
        logger.info(
            "  → Done: %.2fs, seed=%d, recurrence_5y=%.3f [%.3f–%.3f]",
            sim.runtime_seconds,
            sim.random_seed,
            sim.recurrence_5y_mean,
            sim.recurrence_5y_ci_low,
            sim.recurrence_5y_ci_high,
        )
        results.append(sim.dict())

    elapsed = time.perf_counter() - pipeline_start
    logger.info(
        "PIPELINE Step 5: Returning %d hospital result(s) — total %.2fs",
        len(results),
        elapsed,
    )

    return {
        "results": results,
        "patient_summary": profile.dict(),
    }
