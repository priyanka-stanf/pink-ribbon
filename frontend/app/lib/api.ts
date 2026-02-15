import axios from "axios";

const API_BASE_URL = "https://pinkribbon.onrender.com"; // BACKEND DEPLOYMENT

interface SimulationInput {
  age: number;
  onset_time: number;
  hospital_class: string;
}

export interface ProjectionParams {
  age: number;
  zip_code: string;
  menopausal_status?: string;
  stage_at_diagnosis?: string;
  er_positive?: boolean;
  pr_positive?: boolean;
  her2_positive?: boolean;
  fertility_preservation_concern?: boolean;
}

export interface PathwayResult {
  pathway: string;
  probability_recurrence_5y: number;
  probability_recurrence_5y_95_si_low: number;
  probability_recurrence_5y_95_si_high: number;
  cost_distribution: {
    median: number;
    iqr: number;
  };
  expected_symptom_months_moderate_severe: number;
  mean_quality_adjusted_months_5y: number;
  probability_major_long_term_side_effect: number;
}

export interface ProjectionResult {
  pathways: PathwayResult[];
  monte_carlo_n_iterations?: number;
  monte_carlo_computation_seconds?: number;
  data_provenance?: string;
}

export async function runSimulation(data: SimulationInput) {
  const response = await axios.post(`${API_BASE_URL}/simulate`, data);
  return response.data;
}

export async function runProjection(data: ProjectionParams): Promise<ProjectionResult> {
  const response = await axios.post(`${API_BASE_URL}/project`, data);
  return response.data;
}
