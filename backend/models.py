"""
PinkRibbon input model. All fields optional except age and zip for projection.
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
    """User inputs for breast cancer outcome projection. Stage/subtype sampled from SEER if missing."""

    age: int = Field(..., ge=18, le=100, description="Age at diagnosis")
    zip_code: str = Field(..., min_length=1, max_length=10, description="ZIP code for geographic adjustment")
    menopausal_status: Optional[MenopausalStatus] = Field(
        default=MenopausalStatus.unknown, description="Menopausal status if available"
    )
    stage_at_diagnosis: Optional[StageAtDiagnosis] = Field(
        default=StageAtDiagnosis.unknown, description="Tumor stage at diagnosis (AJCC); if unknown, sampled from SEER by age"
    )
    er_positive: Optional[bool] = Field(default=None, description="ER positive if known")
    pr_positive: Optional[bool] = Field(default=None, description="PR positive if known")
    her2_positive: Optional[bool] = Field(default=None, description="HER2 positive if known; if unknown, sampled from SEER")
    fertility_preservation_concern: bool = Field(
        default=False, description="Optional fertility preservation concern flag"
    )

    class Config:
        use_enum_values = True
