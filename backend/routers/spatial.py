"""
Geospatial aggregation endpoints (Section 5, module 4 — Geospatial Dashboard).

Enforces the minimum-count-per-region privacy threshold via
services/aggregation.py before any region appears in the response.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.schemas import AggregatedRegionStats
from services.aggregation import aggregate_by_region

router = APIRouter(prefix="/spatial")


@router.get("/clusters", response_model=list[AggregatedRegionStats])
async def get_clusters(
    state: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    rows = await aggregate_by_region(db, state)
    return [AggregatedRegionStats(**row) for row in rows]
