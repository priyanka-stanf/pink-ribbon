# CareCompass: Three-Stage MVP

CareCompass is refactored into a **personalized, location-aware breast cancer treatment simulator** with three stages:

1. **Patient Intake** – PDF upload or structured survey
2. **Local Hospital Mapping** – Nearby hospitals by ZIP (25-mile radius)
3. **Hospital-Specific Simulation Dashboard** – Comparison table and per-hospital outcome distributions

## Flow

- **Home (`/`)** – Choose “Upload PDF” or “Structured survey”.
- **Intake (`/intake`)**  
  - **PDF:** Drag-and-drop PDF → rule-based extraction → confirm/edit profile → Continue.  
  - **Survey:** Step 1 (diagnosis: age, stage, receptors, node), Step 2 (health: comorbidities, adherence), Step 3 (ZIP) → See hospital comparison.
- **Results (`/results`)** – Table of nearby hospitals with 5-year recurrence range, average QALM, average cost, distance. Click a row for detail.
- **Hospital detail (`/hospitals/[id])** – Recurrence mean/CI, QALM and cost distributions (bell-curve style), inferred treatment mix, disclaimer.

## Backend (FastAPI)

- **No paid APIs.** ZIP→lat/lon and CMS-style hospital list are stored locally under `backend/data/`.
- **Endpoints:**  
  - `POST /parse_pdf` – PDF file upload → extracted patient profile (rule-based).  
  - `POST /submit_profile` – Accept structured profile (survey or post-PDF).  
  - `GET /hospitals?zip=...` – Hospitals within 25 miles (Haversine, local data).  
  - `POST /run_simulation` – Body: `{ profile, hospital_id }` → one hospital’s simulation.  
  - `POST /results` – Body: profile → hospitals + simulations for all nearby (one-shot).
- **Simulation:** 5,000 iterations per hospital; pathway sampled from hospital-type weights (academic vs community); returns recurrence mean/CI, QALM/cost percentiles, symptom months, treatment mix, disclaimer.
- **Data:**  
  - `backend/data/zip_lat_lon.csv` – ZIP → lat/lon (expandable).  
  - `backend/data/cms_hospitals.csv` – Hospital id, name, lat, lon, type, quality_rating.

## Frontend (Next.js)

- **Profile/results** – Stored in React context and `sessionStorage` so results and detail pages can use them.
- **Intake** – Single intake page with `mode=pdf` or `mode=survey`; survey is 3 steps.
- **Results** – One table; no extra charts until user opens a hospital.
- **Hospital detail** – Distribution summaries (recurrence, QALM, cost), treatment mix, and a clear disclaimer that projections are probabilistic and based on public registry and hospital-level modeling.

## Running

- **Backend:** `cd backend && uvicorn main:app --reload` (default port 8000). Required for intake → results → hospital detail.
- **Frontend:** `cd frontend && npm run dev` (default port 3000). The app calls `/api/results` and `/api/run_simulation` (Next.js proxy to the backend), so both servers must be running for the full flow.
- Bulk `/results` uses 30 iterations per hospital (2 hospitals) so the request returns in 1–2 seconds.

## Modeling notes

- **0–5 year horizon only;** no life expectancy.
- **Recurrence** = probability of recurrence within 5 years from diagnosis; treatment effect via hazard ratios (SEER/EBCTCG-style).
- **Treatment mix** = inferred by hospital type (academic vs community), not actual tumor board behavior.
- All outputs should be presented as **probabilistic** and based on **public registry and hospital-level patterns**; disclaimers are shown in the UI.
