"""
CareCompass API. Single endpoint: POST /analyze.

Pipeline:
  1. Run Monte Carlo simulation for all eligible treatment pathways
  2. Rank pathways by multi-objective utility
  3. Recommend best plan
  4. Find nearby hospitals that can provide the recommended plan
  5. Return everything in one response

0–5 year horizon. No life expectancy. No paid APIs.
"""

import logging
import time
from typing import Any, Dict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import PatientInput
from simulation_pathway_engine import run_projection, ITERATIONS_PER_PATHWAY
from services.hospital_service import zip_to_latlon, find_hospitals_near_zip
from services.hospital_scoring import score_and_rank_hospitals

logger = logging.getLogger("carecompass")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s  %(message)s",
)

app = FastAPI(
    title="CareCompass",
    description="End-to-end breast cancer treatment simulator: best plan + hospital recommendation. 0–5 year horizon.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SEARCH_RADIUS_MILES = 25.0
MAX_HOSPITALS = 5


@app.get("/health")
def health():
    return {"status": "ok", "service": "CareCompass"}


@app.post("/analyze")
def analyze(patient: PatientInput) -> Dict[str, Any]:
    """
    Full pipeline: simulate → rank plans → recommend hospitals.
    Returns simulation results + recommended plan + top 5 hospitals.
    """
    pipeline_start = time.perf_counter()

    # ── Step 1: Run Monte Carlo simulation and rank pathways ──────────
    logger.info("PIPELINE Step 1: Running Monte Carlo simulation for patient age=%d zip=%s", patient.age, patient.zip_code)
    projection = run_projection(patient, n_iterations=ITERATIONS_PER_PATHWAY)
    recommended_key = projection["recommended_plan"]["pathway_key"]
    logger.info(
        "  → %d pathways simulated in %.2fs, recommended: %s",
        len([p for p in projection["pathways"] if p.get("eligible")]),
        projection["monte_carlo"]["runtime_seconds"],
        recommended_key,
    )

    # ── Step 2: Find hospitals near patient's ZIP ─────────────────────
    logger.info("PIPELINE Step 2: Finding hospitals within %.0f miles of ZIP %s", SEARCH_RADIUS_MILES, patient.zip_code)
    coords = zip_to_latlon(patient.zip_code)
    hospitals_top5 = []
    hospital_message = None

    if coords is None:
        hospital_message = f"ZIP {patient.zip_code} not found in local dataset. Hospital lookup skipped."
        logger.warning("  → %s", hospital_message)
    else:
        nearby = find_hospitals_near_zip(
            patient.zip_code,
            radius_miles=SEARCH_RADIUS_MILES,
            max_results=20,
        )
        if not nearby:
            hospital_message = f"No hospitals found within {SEARCH_RADIUS_MILES:.0f} miles of ZIP {patient.zip_code}."
            logger.warning("  → %s", hospital_message)
        else:
            logger.info("  → Found %d hospital(s), scoring for '%s'", len(nearby), recommended_key)
            hospitals_top5 = score_and_rank_hospitals(
                nearby, recommended_key, max_results=MAX_HOSPITALS,
            )
            logger.info("  → Top %d hospitals ranked", len(hospitals_top5))

    pipeline_elapsed = time.perf_counter() - pipeline_start
    logger.info("PIPELINE complete in %.2fs", pipeline_elapsed)

    # ── Assemble response ─────────────────────────────────────────────
    response = projection  # contains monte_carlo, patient_summary, pathways, recommended_plan, provenance
    response["hospitals_top5"] = hospitals_top5
    if hospital_message:
        response["hospital_message"] = hospital_message
    response["pipeline_runtime_seconds"] = round(pipeline_elapsed, 3)

    return response
