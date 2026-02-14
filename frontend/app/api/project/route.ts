const BACKEND_URL =
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** Mock when backend unavailable. Same shape as pathway projection (0-5y, no life expectancy). */
function mockProjection(body: Record<string, unknown>) {
  const pathways = [
    "lumpectomy_radiation",
    "mastectomy_no_recon",
    "mastectomy_recon",
    "chemotherapy_plus_surgery",
    "endocrine_therapy",
    "her2_targeted",
    "clinical_trial",
  ].slice(0, 4).map((pathway) => ({
    pathway,
    probability_recurrence_5y: 0.08 + Math.random() * 0.12,
    probability_recurrence_5y_95_si_low: 0.05,
    probability_recurrence_5y_95_si_high: 0.18,
    cost_distribution: { median: 75000, q1: 62000, q3: 91000, iqr: 29000 },
    expected_symptom_months_moderate_severe: 4 + Math.random() * 8,
    mean_quality_adjusted_months_5y: 52 + Math.random() * 6,
    probability_major_long_term_side_effect: 0.05 + Math.random() * 0.15,
    variance_contribution: { recurrence: 0.3, cost: 0.25, symptom_months: 0.22, qalm: 0.23 },
    uncertainty_drivers: {
      baseline_stage_distribution: 0.2,
      treatment_effect_uncertainty: 0.25,
      toxicity_probability_uncertainty: 0.22,
      cost_distribution_variability: 0.28,
      regional_utilization_variability: 0.05,
    },
    average_symptom_intensity_by_month: Array.from({ length: 60 }, (_, m) => (m < 6 ? 0.4 - m * 0.05 : 0.1)),
    evidence: {},
    higher_uncertainty_label: pathway === "clinical_trial" ? "Higher uncertainty due to investigational treatment variability." : undefined,
    n_iterations: 5000,
  }));
  return {
    monte_carlo_n_iterations: 5000,
    monte_carlo_computation_seconds: 0,
    random_seed_used: 12345,
    parameter_sources_accessed: ["SEER", "params_recurrence_5y", "params_treatment_effects", "params_symptoms", "params_costs", "params_geo"],
    horizon_years: 5,
    stage_sampled: "II",
    subtype_sampled: "HR+",
    pathways,
    narrative_summary: "Mock summary. Run backend for full narrative.",
    data_provenance: "Mock when backend unavailable. Run backend for SEER/CMS/PubMed-based Monte Carlo.",
  };
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  try {
    const res = await fetch(`${BACKEND_URL}/project`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return Response.json(
        data?.detail || data?.error || { error: res.statusText },
        { status: res.status }
      );
    }
    return Response.json(data);
  } catch {
    return Response.json(mockProjection(body));
  }
}
