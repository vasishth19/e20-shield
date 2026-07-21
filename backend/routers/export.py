"""
PDF export endpoint (Section 5, module 8 / Section 9).

Accepts the same query params as /vehicles/lookup (plus optional risk
prediction inputs) and streams back a one-page PDF report.
"""

from fastapi import APIRouter, Query
from fastapi.responses import Response

from services.fallback_rules import estimate_from_year
from services.pdf_export import generate_compatibility_pdf

router = APIRouter(prefix="/export")


@router.get("/report.pdf")
async def export_report(
    make: str = Query(...),
    model: str = Query(...),
    year: int = Query(...),
):
    """
    Minimal Phase 6 implementation: re-derives the fallback estimate for the
    PDF (a full implementation would re-use the same DB lookup as
    /vehicles/lookup — left as a follow-up since it's a straightforward
    dedup of routers/vehicles.py::lookup_vehicle).
    """
    estimate = estimate_from_year(year)
    vehicle_lookup = {
        "match_type": "estimated",
        "make": make,
        "model": model,
        "mfg_year": year,
        "emission_standard": estimate["emission_standard"],
        "max_safe_ethanol_pct": estimate["max_safe_ethanol_pct"],
        "confidence": estimate["confidence"],
        "disclaimer": "Estimated from manufacturing year, not vehicle-specific verified data.",
    }
    pdf_bytes = generate_compatibility_pdf(vehicle_lookup)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={make}_{model}_{year}_report.pdf"},
    )
