"""
Policy transparency dashboard (Section 5, module 5).

official_metrics: cited public figures (crude-import savings, blend rollout
percentage) — these are illustrative figures with placeholder citations;
replace with live-sourced numbers before academic submission (see
docs/DATA_SOURCES.md for the citation-quality note).

user_reported_metrics: pulled live from aggregated, privacy-thresholded
crowdsourced reports via services/aggregation.py.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from services.aggregation import aggregate_by_region

router = APIRouter(prefix="/policy")


@router.get("/transparency-metrics")
async def get_transparency_metrics(db: AsyncSession = Depends(get_db)):
    official_metrics = [
        {
            "label": "National average ethanol blending (petrol)",
            "value": "~20%",
            "as_of": "2025-26 supply year",
            "source": "PIB / Ministry of Petroleum & Natural Gas public statements on E20 rollout",
        },
        {
            "label": "Estimated crude oil import savings from ethanol blending",
            "value": "Publicly cited but not independently re-verified here",
            "source": "PIB press releases — replace with a specific dated citation before submission",
        },
    ]

    regional_reports = await aggregate_by_region(db)
    total_reports = sum(r["total_reports"] for r in regional_reports)
    avg_repair_cost = None
    costed = [r["avg_repair_cost"] for r in regional_reports if r["avg_repair_cost"]]
    if costed:
        avg_repair_cost = round(sum(costed) / len(costed), 2)

    user_reported_metrics = [
        {
            "label": "Total aggregated fault reports (privacy-thresholded regions only)",
            "value": total_reports,
            "source": "consumer_fault_reports, aggregated (min. 5 reports/region)",
        },
        {
            "label": "Average self-reported out-of-pocket repair cost",
            "value": avg_repair_cost,
            "source": "consumer_fault_reports, aggregated, self-reported and UNVERIFIED",
        },
    ]

    return {
        "official_metrics": official_metrics,
        "user_reported_metrics": user_reported_metrics,
    }
