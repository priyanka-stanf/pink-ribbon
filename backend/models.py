"""
CareCompass data models. PatientInput for intake; response models for /analyze.
"""

from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


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
    """User inputs for breast cancer outcome projection."""
    age: int = Field(..., ge=18, le=100, description="Age at diagnosis")
    zip_code: str = Field(..., min_length=1, max_length=10, description="ZIP code")
    menopausal_status: Optional[MenopausalStatus] = Field(default=MenopausalStatus.unknown)
    stage_at_diagnosis: Optional[StageAtDiagnosis] = Field(default=StageAtDiagnosis.unknown)
    er_positive: Optional[bool] = Field(default=None, description="ER+ if known")
    pr_positive: Optional[bool] = Field(default=None, description="PR+ if known")
    her2_positive: Optional[bool] = Field(default=None, description="HER2+ if known")
    fertility_preservation_concern: bool = Field(default=False)
    treatment_adherence: float = Field(default=1.0, ge=0.70, le=1.0)

    class Config:
        use_enum_values = True
