# PinkRibbon data provenance

Treatment pathway projection (0-5 year horizon). No life expectancy. All stochastic parameters trace to **SEER**, **CMS**, **PubMed** (meta-analyses/RCTs), or **explicit documented assumptions**. No invented side effect rates or arbitrary cost numbers.

## Backend parameter modules

| Module | Source | Citation |
|--------|--------|----------|
| `params_seer` | SEER 18, SEER*Explorer | Stage and subtype distribution by age. https://seer.cancer.gov/statistics-network/explorer/ |
| `params_recurrence_5y` | SEER / EBCTCG | 5-year recurrence probability by stage (baseline for Monte Carlo). |
| `params_pathways` | NCCN/ASCO literature | Discrete pathways and eligibility by stage/subtype. |
| `params_treatment_effects` | PubMed RCTs / meta-analyses | Recurrence HR by pathway; clinical trial effect from published ranges. |
| `params_symptoms` | PubMed meta-analyses | Acute and persistent symptom rates; utility weights (EQ-5D, literature). |
| `params_costs` | CMS | data.cms.gov: procedure cost distributions (mean, CV); pathway-level sampling. |
| `params_geo` | Census / CMS | ZIP→state; regional cost modifier. |

## APIs (all free)

- **PubMed**: NCBI E-utilities (eutils.ncbi.nlm.nih.gov). Rate limit: 3 req/s without key. Used in `data_fetchers.py` for optional citation fetch.
- **SEER**: Public datasets and SEER*Explorer; no key required.
- **CMS**: data.cms.gov; public downloads.
- **CDC / ClinicalTrials.gov**: Free public APIs.

No paid APIs, commercial healthcare APIs, OpenAI, or per-request charge services are used.

## Assumptions (explicit)

- Where stage or subtype is unknown, we sample from SEER age-conditional distributions.
- Regional cost modifier defaults to 1.0 until a CMS regional table is loaded.
- OOP cost: approximated using average coinsurance where needed; documented in params_costs.
- Recurrence baseline and symptom rates: see params_recurrence_5y, params_symptoms; engine: simulation_pathway_engine.
