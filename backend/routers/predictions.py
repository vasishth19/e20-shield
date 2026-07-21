"""
Risk prediction endpoints (Section 8).

Uses the trained GradientBoostingRegressor + SHAP explainability from
ml_core/risk_predictor.py. Falls back to a simple rule-based estimate only
if the model pipeline itself errors (e.g. missing optional dependency),
so this endpoint never hard-fails.
"""

import logging

from fastapi import APIRouter

from models.schemas import RiskPredictionRequest, RiskPredictionResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/predict")


def _rule_based_fallback(payload: RiskPredictionRequest) -> dict:
    base_score = 100.0
    base_score -= payload.vehicle_age_years * 3.5
    if payload.fuel_delivery_system.value == "Carburettor":
        base_score -= 15
    if payload.native_ethanol_tolerance_pct < 20:
        base_score -= (20 - payload.native_ethanol_tolerance_pct) * 1.2
    base_score -= min(payload.self_reported_monthly_km / 500, 20)
    score = max(0.0, min(100.0, base_score))

    factors = []
    if payload.fuel_delivery_system.value == "Carburettor":
        factors.append("Carburettor fuel delivery (higher ethanol sensitivity)")
    if payload.vehicle_age_years > 7:
        factors.append("Vehicle age over 7 years")
    if not factors:
        factors.append("No major risk factors identified (fallback estimator)")

    return {
        "component_health_score": round(score, 1),
        "estimated_months_to_service_need": round(max(1.0, score / 5.0), 1),
        "confidence_interval_low": round(max(0.0, score - 15), 1),
        "confidence_interval_high": round(min(100.0, score + 15), 1),
        "top_contributing_factors": factors,
    }


@router.post("/risk-score", response_model=RiskPredictionResponse)
async def predict_risk(payload: RiskPredictionRequest):
    try:
        from ml_core.risk_predictor import predict_risk as ml_predict

        result = ml_predict(
            vehicle_age_years=payload.vehicle_age_years,
            native_ethanol_tolerance_pct=payload.native_ethanol_tolerance_pct,
            fuel_delivery_system=payload.fuel_delivery_system.value,
            self_reported_monthly_km=payload.self_reported_monthly_km,
            region_state=payload.region_state,
        )
    except Exception:
        logger.exception("ML risk model failed, using rule-based fallback")
        result = _rule_based_fallback(payload)

    return RiskPredictionResponse(**result)
