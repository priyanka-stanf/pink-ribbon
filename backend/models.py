"""
CareCompass data contracts. Strict types used end-to-end: intake → /analyze → frontend.
"""

from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Legacy model kept for simulation_pathway_engine.py backward compatibility
# ---------------------------------------------------------------------------

class MenopausalStatus(str, Enum):
    pre = "pre"
    post = "post"
    unknown = "unknown"


class StageAtDiagnosis(str, Enum):
    I = "I"
    II = "II"
    III = "III"
    IV = "IV"
    unknown = "unknown"


class PatientInput(BaseModel):
    """Legacy: used by simulation_pathway_engine.run_projection only."""
    age: int = Field(..., ge=18, le=100)
    zip_code: str = Field(..., min_length=1, max_length=10)
    menopausal_status: Optional[MenopausalStatus] = Field(default=MenopausalStatus.unknown)
    stage_at_diagnosis: Optional[StageAtDiagnosis] = Field(default=StageAtDiagnosis.unknown)
    er_positive: Optional[bool] = Field(default=None)
    pr_positive: Optional[bool] = Field(default=None)
    her2_positive: Optional[bool] = Field(default=None)
    fertility_preservation_concern: bool = Field(default=False)
    treatment_adherence: float = Field(default=1.0, ge=0.70, le=1.0)

    class Config:
        use_enum_values = True


# ---------------------------------------------------------------------------
# New strict contracts for POST /analyze
# ---------------------------------------------------------------------------

class PatientProfile(BaseModel):
    """Patient intake data. Accepted by POST /analyze."""
    age: int = Field(..., ge=18, le=100, description="Age at diagnosis")
    zip_code: str = Field(..., min_length=1, max_length=10, description="5-digit ZIP")
    stage: str = Field(
        default="Unknown",
        description="AJCC stage: I, II, III, IV, or Unknown",
    )
    er_status: Optional[bool] = Field(default=None, description="ER+ (True), ER- (False), unknown (None)")
    pr_status: Optional[bool] = Field(default=None, description="PR+ (True), PR- (False), unknown (None)")
    her2_status: Optional[bool] = Field(default=None, description="HER2+ (True), HER2- (False), unknown (None)")
    node_status: Optional[bool] = Field(default=None, description="Node+ (True), Node- (False), unknown (None)")
    comorbidities: List[str] = Field(default_factory=list, description="e.g. diabetes, cardiovascular_disease")
    current_symptoms: List[str] = Field(default_factory=list, description="Currently reported symptoms")
    fertility_concern: bool = Field(default=False, description="Fertility preservation concern")


class Hospital(BaseModel):
    """Hospital returned in analysis results."""
    id: str
    name: str
    type: str = Field(description="academic | community | unknown")
    distance_miles: float
    lat: float
    lon: float


class DistributionSummary(BaseModel):
    """Percentile summary + sampled values for frontend plotting."""
    values: List[float] = Field(default_factory=list, description="Subsampled raw values for histogram")
    p5: float = 0.0
    p25: float = 0.0
    p50: float = 0.0
    p75: float = 0.0
    p95: float = 0.0
    mean: float = 0.0
    std: float = 0.0


# TreatmentMix keys (API contract):
#   lumpectomy_radiation, mastectomy_no_recon, mastectomy_recon,
#   endocrine_only, chemo_plus_surgery, her2_targeted, clinical_trial
TREATMENT_MIX_KEYS = [
    "lumpectomy_radiation",
    "mastectomy_no_recon",
    "mastectomy_recon",
    "endocrine_only",
    "chemo_plus_surgery",
    "her2_targeted",
    "clinical_trial",
]


class HospitalSimulationResult(BaseModel):
    """Full Monte Carlo result for one hospital. Returned by POST /analyze."""
    hospital: Hospital
    treatment_mix: Dict[str, float] = Field(description="Pathway weights summing to 1.0")
    N_iterations: int
    runtime_seconds: float
    random_seed: int
    # Recurrence
    recurrence_5y_mean: float
    recurrence_5y_ci_low: float
    recurrence_5y_ci_high: float
    # Outcomes
    symptom_months_mean: float
    qalm_mean: float
    major_lte_prob: float
    # Cost
    cost_median: float
    cost_iqr: List[float] = Field(description="[q1, q3]")
    # Optional distributions for plotting
    recurrence_dist: Optional[DistributionSummary] = None
    qalm_dist: Optional[DistributionSummary] = None
    cost_dist: Optional[DistributionSummary] = None
    symptom_dist: Optional[DistributionSummary] = None
    # Metadata
    stage_used: str = ""
    subtype_used: str = ""
    disclaimer: str = (
        "Treatment patterns are inferred proxies based on hospital type and public data, "
        "not exact tumor board decisions. Projections are probabilistic. 0\u20135 year horizon only."
    )
