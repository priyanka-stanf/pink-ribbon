import axios from 'axios';
import { Hospital } from '../data/mockData';

// In production the SPA and the Python function share an origin (see vercel.json
// rewrites), so an empty base issues same-origin requests and no CORS is needed.
const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:8000');

export interface PatientInput {
  age: number;
  zip_code: string;
  menopausal_status?: 'pre' | 'post' | 'unknown';
  stage_at_diagnosis?: 'I' | 'II' | 'III' | 'IV' | 'unknown';
  er_positive?: boolean | null;
  pr_positive?: boolean | null;
  her2_positive?: boolean | null;
  fertility_preservation_concern?: boolean;
}

export interface PathwayResult {
  pathway: string;
  probability_recurrence_5y: number;
  probability_recurrence_5y_95_si_low: number;
  probability_recurrence_5y_95_si_high: number;
  cost_distribution: {
    median: number;
    q1: number;
    q3: number;
    iqr: number;
  };
  expected_symptom_months_moderate_severe: number;
  mean_quality_adjusted_months_5y: number;
  probability_major_long_term_side_effect: number;
  variance_contribution: {
    recurrence: number;
    cost: number;
    symptom_months: number;
    qalm: number;
  };
  n_iterations: number;
}

export interface ProjectionResult {
  monte_carlo_n_iterations: number;
  monte_carlo_computation_seconds: number;
  horizon_years: number;
  stage_sampled: string;
  subtype_sampled: string;
  pathways: PathwayResult[];
  data_provenance: string;
}

// Pathway display names
export const PATHWAY_NAMES: Record<string, string> = {
  lumpectomy_radiation: 'Lumpectomy + Radiation',
  mastectomy_no_recon: 'Mastectomy (No Reconstruction)',
  mastectomy_recon: 'Mastectomy + Reconstruction',
  chemotherapy_plus_surgery: 'Chemotherapy + Surgery',
  endocrine_therapy: 'Endocrine Therapy',
  her2_targeted: 'HER2 Targeted Therapy',
  clinical_trial: 'Clinical Trial'
};

// Map backend pathway names to treatment IDs in mockData
export const PATHWAY_TO_TREATMENT_ID: Record<string, string> = {
  lumpectomy_radiation: 't1',
  mastectomy_no_recon: 't2',
  mastectomy_recon: 't2',
  chemotherapy_plus_surgery: 't3',
  endocrine_therapy: 't3', // Grouped with chemotherapy
  her2_targeted: 't4',
  clinical_trial: 't5'
};

// Calculate best treatment based on lowest recurrence probability from Monte Carlo simulation
export function calculateBestTreatment(pathways: PathwayResult[]): string | null {
  if (!pathways || pathways.length === 0) return null;

  // Best treatment = pathway with lowest 5-year recurrence probability from backend simulation
  const sorted = [...pathways].sort((a, b) => a.probability_recurrence_5y - b.probability_recurrence_5y);
  return sorted[0].pathway;
}

export async function runProjection(params: PatientInput): Promise<ProjectionResult> {
  try {
    console.log('Calling backend API:', `${API_BASE_URL}/project`);
    console.log('Patient input:', params);

    const response = await axios.post(`${API_BASE_URL}/project`, params, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });

    console.log('Backend response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);

    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. The simulation is taking too long. Please try again.');
      }
      if (error.response) {
        // Server responded with error status
        const message = error.response.data?.detail || error.response.data?.message || `Server error: ${error.response.status}`;
        throw new Error(message);
      }
      if (error.request) {
        // Request made but no response
        throw new Error('Cannot connect to backend server. Please ensure the backend is running on http://localhost:8000');
      }
    }
    throw new Error('Failed to run simulation. Please try again.');
  }
}

export async function checkHealth(): Promise<{ status: string; service: string }> {
  const response = await axios.get(`${API_BASE_URL}/health`);
  return response.data;
}

export interface HospitalSearchResult {
  hospitals: Hospital[];
  query_zip: string;
  count: number;
}

export async function searchHospitals(zipCode: string): Promise<HospitalSearchResult> {
  const response = await axios.get(`${API_BASE_URL}/hospitals/search`, {
    params: { zip_code: zipCode },
    timeout: 10000,
  });
  return response.data;
}
