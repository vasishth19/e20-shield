"""
Pydantic v2 schemas — request/response contracts for the API surface
described in Section 9. Kept separate from ORM models (models/orm.py)
so the DB shape and the API shape can evolve independently.
"""

from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


# ---------------------------------------------------------------------------
# Shared enums
# ---------------------------------------------------------------------------

class MatchType(str, Enum):
    """
    Every lookup result is tagged with exactly one of these — this is the
    core fact/opinion/prediction separation principle from the spec.
    """
    verified = "verified"
    estimated = "estimated"


class FuelDeliverySystem(str, Enum):
    carburettor = "Carburettor"
    fuel_injection = "Fuel_Injection"


class ConfidenceLevel(str, Enum):
    low = "Low"
    medium = "Medium"
    medium_high = "Medium-High"
    high = "High"


class SubmissionStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class InsuranceClaimStatus(str, Enum):
    approved = "approved"
    denied = "denied"
    not_attempted = "not_attempted"


# ---------------------------------------------------------------------------
# Vehicle search / lookup
# ---------------------------------------------------------------------------

class VehicleSearchResult(BaseModel):
    """Autocomplete suggestion — a UX convenience, never a hard restriction."""
    make: str
    model: str
    years_available: list[int] = Field(default_factory=list)


class VehicleLookupRequest(BaseModel):
    """Accepts ANY free-text make/model/year. Never rejected."""
    make: str = Field(..., min_length=1, max_length=50)
    model: str = Field(..., min_length=1, max_length=50)
    mfg_year: int = Field(..., ge=1980, le=2100)


class VehicleLookupResponse(BaseModel):
    match_type: MatchType
    make: str
    model: str
    mfg_year: int
    emission_standard: str
    fuel_delivery_system: Optional[str] = None
    fuel_tank_material: Optional[str] = None
    max_safe_ethanol_pct: int
    confidence: ConfidenceLevel
    source_reference: Optional[str] = Field(
        default=None,
        description="Present only for 'verified' matches — cites the origin of the spec.",
    )
    disclaimer: str = Field(
        default=(
            "This is an estimate derived from your vehicle's manufacturing year, "
            "not vehicle-specific verified data. Submit your exact vehicle to help "
            "improve accuracy for everyone."
        )
    )


class VehicleSubmissionCreate(BaseModel):
    make: str = Field(..., min_length=1, max_length=50)
    model: str = Field(..., min_length=1, max_length=50)
    mfg_year: int = Field(..., ge=1980, le=2100)
    claimed_emission_standard: Optional[str] = Field(default=None, max_length=15)
    claimed_fuel_delivery_system: Optional[FuelDeliverySystem] = None
    submitted_by: Optional[UUID] = None


class VehicleSubmissionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    submission_id: int
    make: str
    model: str
    mfg_year: int
    claimed_emission_standard: Optional[str]
    claimed_fuel_delivery_system: Optional[str]
    submitted_at: datetime
    status: SubmissionStatus


# ---------------------------------------------------------------------------
# Risk prediction
# ---------------------------------------------------------------------------

class RiskPredictionRequest(BaseModel):
    vehicle_age_years: int = Field(..., ge=0, le=60)
    native_ethanol_tolerance_pct: int = Field(..., ge=0, le=100)
    fuel_delivery_system: FuelDeliverySystem
    self_reported_monthly_km: int = Field(..., ge=0, le=20000)
    region_state: Optional[str] = Field(default=None, max_length=50)


class RiskPredictionResponse(BaseModel):
    component_health_score: float = Field(..., ge=0, le=100)
    estimated_months_to_service_need: float
    confidence_interval_low: float
    confidence_interval_high: float
    top_contributing_factors: list[str]
    disclaimer: str = Field(
        default="This is a model estimate, not a diagnosis. Consult a qualified mechanic."
    )


# ---------------------------------------------------------------------------
# Crowdsourced reports
# ---------------------------------------------------------------------------

class FaultReportCreate(BaseModel):
    vehicle_spec_id: Optional[int] = None
    mileage_drop_pct: Optional[float] = Field(default=None, ge=0, le=100)
    has_fuel_line_leak: bool = False
    has_starting_trouble: bool = False
    out_of_pocket_repair_cost: Optional[float] = Field(default=None, ge=0)
    insurance_claim_status: Optional[InsuranceClaimStatus] = None
    region_state: str = Field(..., max_length=50)
    region_district: str = Field(..., max_length=50)


class FaultReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    report_id: int
    reported_at: datetime
    region_state: Optional[str]
    region_district: Optional[str]
    is_verified: bool


class AggregatedRegionStats(BaseModel):
    """
    Aggregated counts only — individual reports are never exposed by
    region/coordinate to prevent re-identification (min-count threshold
    enforced in services/aggregation.py).
    """
    region_state: str
    region_district: Optional[str] = None
    total_reports: int
    pct_fuel_line_leak: float
    pct_starting_trouble: float
    avg_mileage_drop_pct: Optional[float] = None
    avg_repair_cost: Optional[float] = None
