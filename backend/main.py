"""
PinkRibbon API. Treatment pathway projection (0-5 year). No life expectancy.
Simulation does not run at page load; only when POST /project is called.
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models import PatientInput
from simulation_pathway_engine import run_projection, ITERATIONS_PER_PATHWAY
from hospital_search import search_hospitals

logger = logging.getLogger("pinkribbon")
logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="PinkRibbon",
    description="Treatment pathway projection for newly diagnosed breast cancer. 0-5 year horizon. SEER, CMS, PubMed.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "PinkRibbon"}


@app.post("/project")
def project(patient: PatientInput):
    """
    Run Monte Carlo simulation for multiple treatment pathways. 0-5 year horizon only.
    Triggered only by form submission; not at page load.
    Logs iteration count and computation time.
    """
    n_iter = ITERATIONS_PER_PATHWAY
    result = run_projection(patient, n_iterations=n_iter)
    logger.info(
        "Monte Carlo executed: n_iterations=%s, computation_seconds=%s",
        result.get("monte_carlo_n_iterations"),
        result.get("monte_carlo_computation_seconds"),
    )
    return result

@app.get("/hospitals/search")
def hospital_search(zip_code: str = "", radius_miles: float = 50.0):
    """
    Return hospitals near the given ZIP code, ranked by true great-circle distance
    from the ZIP's Census centroid. Falls back to ZIP3-prefix matching for ZIPs that
    are absent from the centroid table.
    """
    results = search_hospitals(zip_code, limit=50, radius_miles=radius_miles)
    return {
        "hospitals": results,
        "query_zip": zip_code,
        "radius_miles": radius_miles,
        "count": len(results),
    }
