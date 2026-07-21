"""
Crowdsourced fault report submission (Section 5, module 3).

Phase 1: create + list-own endpoints. Aggregation/heatmap queries (with the
min-count privacy threshold) are implemented in services/aggregation.py and
exposed via routers/spatial.py in Phase 4.
"""

from geoalchemy2.functions import ST_MakePoint, ST_SetSRID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.orm import ConsumerFaultReport
from models.schemas import FaultReportCreate, FaultReportOut

router = APIRouter(prefix="/reports")

# District centroid lookup is a placeholder — Phase 4 wires this to a real
# state/district centroid table so we never store a user's exact coordinates.
_PLACEHOLDER_CENTROID = (77.2090, 28.6139)  # Delhi, as a neutral placeholder


@router.post("/submit", response_model=FaultReportOut, status_code=201)
async def submit_report(payload: FaultReportCreate, db: AsyncSession = Depends(get_db)):
    lon, lat = _PLACEHOLDER_CENTROID

    report = ConsumerFaultReport(
        vehicle_spec_id=payload.vehicle_spec_id,
        mileage_drop_pct=payload.mileage_drop_pct,
        has_fuel_line_leak=payload.has_fuel_line_leak,
        has_starting_trouble=payload.has_starting_trouble,
        out_of_pocket_repair_cost=payload.out_of_pocket_repair_cost,
        insurance_claim_status=(
            payload.insurance_claim_status.value if payload.insurance_claim_status else None
        ),
        region_state=payload.region_state,
        region_district=payload.region_district,
        approx_location=ST_SetSRID(ST_MakePoint(lon, lat), 4326),
        is_verified=False,
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report
