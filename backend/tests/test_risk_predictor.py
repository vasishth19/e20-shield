"""Phase 2 tests for the trained risk model + SHAP explainability."""

from ml_core.risk_predictor import predict_risk


def test_old_carburettor_vehicle_scores_lower_than_new_fi_vehicle():
    old_bike = predict_risk(12, 10, "Carburettor", 2500, "Kerala")
    new_car = predict_risk(1, 20, "Fuel_Injection", 500, "Rajasthan")
    assert old_bike["component_health_score"] < new_car["component_health_score"]


def test_response_shape_is_valid():
    result = predict_risk(5, 10, "Fuel_Injection", 1000, None)
    assert 0 <= result["component_health_score"] <= 100
    assert result["confidence_interval_low"] <= result["confidence_interval_high"]
    assert len(result["top_contributing_factors"]) >= 1


def test_no_region_state_does_not_crash():
    result = predict_risk(3, 20, "Fuel_Injection", 800, None)
    assert result["component_health_score"] >= 0
