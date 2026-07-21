"""
ORM models — 1:1 with the schema in Section 7 of the architecture spec.

IMPORTANT (coverage-is-unbounded design principle):
`VehicleRegistrySpec` has no row cap and no notion of an "allowed" vehicle
list. It is a normal, ever-growing reference table. Any make/model/year a
user submits either matches a row here (Verified) or falls through to the
year-based fallback rule engine in services/fallback_rules.py (Estimated).
"""

import uuid

from geoalchemy2 import Geometry
from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class VehicleRegistrySpec(Base):
    """Verified/official vehicle specs — seeded from ARAI + manufacturer data."""

    __tablename__ = "vehicle_registry_specs"

    spec_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    make: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    model: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    mfg_year: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    emission_standard: Mapped[str] = mapped_column(String(15), nullable=False)
    fuel_delivery_system: Mapped[str] = mapped_column(String(20), nullable=False)
    fuel_tank_material: Mapped[str] = mapped_column(String(15), nullable=False)
    max_safe_ethanol_pct: Mapped[int] = mapped_column(Integer, nullable=False)
    source_reference: Mapped[str | None] = mapped_column(Text, nullable=True)

    fault_reports = relationship("ConsumerFaultReport", back_populates="vehicle_spec")


class UserProfile(Base):
    """Mirrors minimal profile data; auth itself is handled by Supabase Auth."""

    __tablename__ = "user_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    display_name: Mapped[str | None] = mapped_column(String(80), nullable=True)
    role: Mapped[str] = mapped_column(String(20), default="user")  # user|researcher|admin
    created_at: Mapped[object] = mapped_column(DateTime, server_default=func.now())

    submissions = relationship("VehicleSubmissionQueue", back_populates="submitter")


class ConsumerFaultReport(Base):
    """Crowdsourced, anonymized/opt-in reports. Never displayed as individual map pins."""

    __tablename__ = "consumer_fault_reports"

    report_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    vehicle_spec_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("vehicle_registry_specs.spec_id"), nullable=True
    )
    reported_at: Mapped[object] = mapped_column(DateTime, server_default=func.now())
    mileage_drop_pct: Mapped[float | None] = mapped_column(Numeric(4, 2), nullable=True)
    has_fuel_line_leak: Mapped[bool] = mapped_column(Boolean, default=False)
    has_starting_trouble: Mapped[bool] = mapped_column(Boolean, default=False)
    out_of_pocket_repair_cost: Mapped[float | None] = mapped_column(
        Numeric(10, 2), nullable=True
    )
    insurance_claim_status: Mapped[str | None] = mapped_column(String(20), nullable=True)
    region_state: Mapped[str | None] = mapped_column(String(50), nullable=True)
    region_district: Mapped[str | None] = mapped_column(String(50), nullable=True)
    # District-centroid granularity ONLY — never the user's exact address.
    approx_location = mapped_column(Geometry(geometry_type="POINT", srid=4326), nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    vehicle_spec = relationship("VehicleRegistrySpec", back_populates="fault_reports")


class VehicleSubmissionQueue(Base):
    """
    Open, uncapped submission queue — how the reference table keeps growing.
    Any user can submit a vehicle; an admin reviews and promotes it to
    VehicleRegistrySpec via routers/vehicles.py::approve_submission.
    """

    __tablename__ = "vehicle_submission_queue"

    submission_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    submitted_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user_profiles.user_id"), nullable=True
    )
    make: Mapped[str] = mapped_column(String(50), nullable=False)
    model: Mapped[str] = mapped_column(String(50), nullable=False)
    mfg_year: Mapped[int] = mapped_column(Integer, nullable=False)
    claimed_emission_standard: Mapped[str | None] = mapped_column(String(15), nullable=True)
    claimed_fuel_delivery_system: Mapped[str | None] = mapped_column(String(20), nullable=True)
    submitted_at: Mapped[object] = mapped_column(DateTime, server_default=func.now())
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending|approved|rejected

    submitter = relationship("UserProfile", back_populates="submissions")
