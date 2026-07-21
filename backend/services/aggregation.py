"""
Region-level aggregation of consumer_fault_reports (Phase 4).

Privacy design: a region is only returned once it has at least
MIN_REPORTS_THRESHOLD reports. Individual reports/coordinates are never
exposed — only per-region counts/percentages.
"""

from sqlalchemy import Integer, cast, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.orm import ConsumerFaultReport

MIN_REPORTS_THRESHOLD = 5


async def aggregate_by_region(db: AsyncSession, state: str | None = None) -> list[dict]:
    stmt = (
        select(
            ConsumerFaultReport.region_state,
            ConsumerFaultReport.region_district,
            func.count().label("total_reports"),
            func.avg(cast(ConsumerFaultReport.has_fuel_line_leak, Integer)).label("pct_leak"),
            func.avg(cast(ConsumerFaultReport.has_starting_trouble, Integer)).label("pct_start"),
            func.avg(ConsumerFaultReport.mileage_drop_pct).label("avg_mileage_drop"),
            func.avg(ConsumerFaultReport.out_of_pocket_repair_cost).label("avg_repair_cost"),
        )
        .group_by(ConsumerFaultReport.region_state, ConsumerFaultReport.region_district)
    )
    if state:
        stmt = stmt.where(ConsumerFaultReport.region_state == state)

    rows = (await db.execute(stmt)).all()

    results = []
    for row in rows:
        if row.total_reports < MIN_REPORTS_THRESHOLD:
            continue  # privacy threshold — suppressed, not returned
        results.append({
            "region_state": row.region_state,
            "region_district": row.region_district,
            "total_reports": row.total_reports,
            "pct_fuel_line_leak": round(float(row.pct_leak or 0) * 100, 1),
            "pct_starting_trouble": round(float(row.pct_start or 0) * 100, 1),
            "avg_mileage_drop_pct": round(float(row.avg_mileage_drop), 1) if row.avg_mileage_drop else None,
            "avg_repair_cost": round(float(row.avg_repair_cost), 2) if row.avg_repair_cost else None,
        })
    return results
