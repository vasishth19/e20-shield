"""
Loads the trained risk model (or trains one on first use if missing) and
produces predictions + SHAP-based explanations for routers/predictions.py.
"""

from pathlib import Path
from functools import lru_cache

import joblib
import numpy as np
import shap

from ml_core.feature_engineering import FEATURE_NAMES, build_feature_vector
from ml_core.model_trainer import train_risk_model, ARTIFACT_DIR

MODEL_PATH = ARTIFACT_DIR / "risk_model.joblib"

_FEATURE_LABELS = {
    "vehicle_age_years": "Vehicle age",
    "native_ethanol_tolerance_pct": "Native ethanol tolerance below E20",
    "is_carburettor": "Carburettor fuel delivery (higher ethanol sensitivity)",
    "self_reported_monthly_km": "High monthly usage",
    "regional_humidity_proxy": "Regional humidity",
}


@lru_cache
def _load_model_bundle():
    if not MODEL_PATH.exists():
        train_risk_model(MODEL_PATH)
    bundle = joblib.load(MODEL_PATH)
    return bundle["model"], bundle["feature_names"]


@lru_cache
def _get_explainer():
    model, _ = _load_model_bundle()
    # TreeExplainer is fast + exact for gradient boosted trees
    return shap.TreeExplainer(model)


def predict_risk(
    vehicle_age_years: int,
    native_ethanol_tolerance_pct: int,
    fuel_delivery_system: str,
    self_reported_monthly_km: int,
    region_state: str | None = None,
) -> dict:
    model, feature_names = _load_model_bundle()
    X = build_feature_vector(
        vehicle_age_years,
        native_ethanol_tolerance_pct,
        fuel_delivery_system,
        self_reported_monthly_km,
        region_state,
    )

    pred = float(model.predict(X)[0])
    pred = max(0.0, min(100.0, pred))

    # Confidence interval approximated from the ensemble's staged predictions spread.
    staged = np.array([p[0] for p in model.staged_predict(X)])
    spread = float(np.std(staged[-20:])) if len(staged) >= 20 else 8.0
    spread = max(spread, 4.0)

    explainer = _get_explainer()
    shap_values = explainer.shap_values(X)[0]
    contributions = sorted(
        zip(feature_names, shap_values),
        key=lambda t: abs(t[1]),
        reverse=True,
    )
    top_factors = [
        _FEATURE_LABELS.get(name, name)
        for name, val in contributions[:3]
        if abs(val) > 0.5
    ] or ["No major risk factors identified"]

    months_to_service = max(1.0, pred / 5.0)

    return {
        "component_health_score": round(pred, 1),
        "estimated_months_to_service_need": round(months_to_service, 1),
        "confidence_interval_low": round(max(0.0, pred - spread), 1),
        "confidence_interval_high": round(min(100.0, pred + spread), 1),
        "top_contributing_factors": top_factors,
    }
