"""
Vehicle search / lookup / submission endpoints — the general-purpose entry
point every user hits first (Section 5, Section 9).

Design invariant: /lookup NEVER returns a 404 for "vehicle not found". It
always returns either a Verified exact match or an Estimated fallback result.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.orm import VehicleRegistrySpec, VehicleSubmissionQueue
from models.schemas import (
    MatchType,
    VehicleLookupRequest,
    VehicleLookupResponse,
    VehicleSearchResult,
    VehicleSubmissionCreate,
    VehicleSubmissionOut,
)
from services.auth import require_admin
from services.fallback_rules import estimate_from_year

router = APIRouter(prefix="/vehicles")


@router.get("/search", response_model=list[VehicleSearchResult])
async def search_vehicles(
    make: str | None = Query(default=None),
    model: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    """
    Autocomplete suggestions only — a UX convenience, never a restriction on
    what a user is allowed to type into /lookup.
    """
    stmt = select(
        VehicleRegistrySpec.make,
        VehicleRegistrySpec.model,
        VehicleRegistrySpec.mfg_year,
    )
    if make:
        stmt = stmt.where(VehicleRegistrySpec.make.ilike(f"%{make}%"))
    if model:
        stmt = stmt.where(VehicleRegistrySpec.model.ilike(f"%{model}%"))
    stmt = stmt.limit(200)

    rows = (await db.execute(stmt)).all()

    grouped: dict[tuple[str, str], list[int]] = {}
    for make_, model_, year_ in rows:
        grouped.setdefault((make_, model_), []).append(year_)

    return [
        VehicleSearchResult(make=m, model=mo, years_available=sorted(set(years)))
        for (m, mo), years in grouped.items()
    ][:150]


@router.get("/lookup", response_model=VehicleLookupResponse)
async def lookup_vehicle(
    make: str = Query(..., min_length=1, max_length=50),
    model: str = Query(..., min_length=1, max_length=50),
    year: int = Query(..., ge=1980, le=2100, alias="year"),
    db: AsyncSession = Depends(get_db),
):
    """
    Accepts ANY free-text make/model/year. Always returns a result:
      Step A — exact match in vehicle_registry_specs -> 'verified'
      Step B — no match -> year-based fallback rule engine -> 'estimated'
    """
    stmt = select(VehicleRegistrySpec).where(
        VehicleRegistrySpec.make.ilike(make.strip()),
        VehicleRegistrySpec.model.ilike(model.strip()),
        VehicleRegistrySpec.mfg_year == year,
    )
    result = (await db.execute(stmt)).scalar_one_or_none()

    if result is not None:
        return VehicleLookupResponse(
            match_type=MatchType.verified,
            make=result.make,
            model=result.model,
            mfg_year=result.mfg_year,
            emission_standard=result.emission_standard,
            fuel_delivery_system=result.fuel_delivery_system,
            fuel_tank_material=result.fuel_tank_material,
            max_safe_ethanol_pct=result.max_safe_ethanol_pct,
            confidence="High",
            source_reference=result.source_reference,
            disclaimer="Verified against manufacturer/ARAI reference data.",
        )

    estimate = estimate_from_year(year)
    return VehicleLookupResponse(
        match_type=MatchType.estimated,
        make=make,
        model=model,
        mfg_year=year,
        emission_standard=estimate["emission_standard"],
        fuel_delivery_system=estimate["fuel_delivery_system"],
        fuel_tank_material=estimate["fuel_tank_material"],
        max_safe_ethanol_pct=estimate["max_safe_ethanol_pct"],
        confidence=estimate["confidence"],
        source_reference=None,
    )


@router.post("/submit-unlisted", response_model=VehicleSubmissionOut, status_code=201)
async def submit_unlisted_vehicle(
    payload: VehicleSubmissionCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Open to any user, no cap on submissions. This is how the reference table
    keeps growing beyond the initial seed data (Section 5, Step C).
    """
    submission = VehicleSubmissionQueue(
        submitted_by=payload.submitted_by,
        make=payload.make.strip(),
        model=payload.model.strip(),
        mfg_year=payload.mfg_year,
        claimed_emission_standard=payload.claimed_emission_standard,
        claimed_fuel_delivery_system=(
            payload.claimed_fuel_delivery_system.value if payload.claimed_fuel_delivery_system else None
        ),
    )
    db.add(submission)
    await db.commit()
    await db.refresh(submission)
    return submission


@router.post("/submissions/{submission_id}/approve", response_model=VehicleSubmissionOut)
async def approve_submission(
    submission_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: dict = Depends(require_admin),
):
    """
    Admin-only — protected by services/auth.py::require_admin (Phase 6).
    Promotes a pending submission into the verified vehicle_registry_specs table.
    """
    submission = await db.get(VehicleSubmissionQueue, submission_id)
    if submission is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Submission not found")

    new_spec = VehicleRegistrySpec(
        make=submission.make,
        model=submission.model,
        mfg_year=submission.mfg_year,
        emission_standard=submission.claimed_emission_standard or "Unknown",
        fuel_delivery_system=submission.claimed_fuel_delivery_system or "Unknown",
        fuel_tank_material="Unknown",
        max_safe_ethanol_pct=10,
        source_reference=f"User-submitted, admin-approved (submission #{submission.submission_id})",
    )
    db.add(new_spec)
    submission.status = "approved"
    await db.commit()
    await db.refresh(submission)
    return submission
