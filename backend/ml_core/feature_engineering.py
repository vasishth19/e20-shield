"""
Feature engineering for the risk model (Section 8).

Encodes the inputs from RiskPredictionRequest into a numeric feature vector
the trained model expects, in a fixed, documented column order.
"""

import numpy as np

FEATURE_NAMES = [
    "vehicle_age_years",
    "native_ethanol_tolerance_pct",
    "is_carburettor",
    "self_reported_monthly_km",
    "regional_humidity_proxy",
]


def build_feature_vector(
    vehicle_age_years: int,
    native_ethanol_tolerance_pct: int,
    fuel_delivery_system: str,
    self_reported_monthly_km: int,
    region_state: str | None = None,
) -> np.ndarray:
    """
    Returns a (1, n_features) numpy array in FEATURE_NAMES order.

    regional_humidity_proxy: a coarse, public-data-informed average relative
    humidity proxy per state (0-100). Coastal/eastern states run higher;
    this is a simplification documented as a limitation in docs/ARCHITECTURE.md.
    """
    is_carburettor = 1.0 if fuel_delivery_system == "Carburettor" else 0.0
    humidity_proxy = _humidity_proxy_for_state(region_state)

    return np.array([[
        float(vehicle_age_years),
        float(native_ethanol_tolerance_pct),
        is_carburettor,
        float(self_reported_monthly_km),
        humidity_proxy,
    ]])


_HIGH_HUMIDITY_STATES = {
    "kerala", "west bengal", "odisha", "goa", "tamil nadu",
    "andhra pradesh", "karnataka", "maharashtra",
}
_LOW_HUMIDITY_STATES = {
    "rajasthan", "gujarat", "punjab", "haryana", "delhi",
    "madhya pradesh", "uttar pradesh",
}


def _humidity_proxy_for_state(region_state: str | None) -> float:
    if not region_state:
        return 55.0  # national rough average, used when state is unknown
    key = region_state.strip().lower()
    if key in _HIGH_HUMIDITY_STATES:
        return 75.0
    if key in _LOW_HUMIDITY_STATES:
        return 35.0
    return 55.0
