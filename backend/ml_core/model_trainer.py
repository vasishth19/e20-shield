"""
Trains the component-wear risk model (Section 8).

Approach: Gradient Boosting Regressor trained on a LITERATURE-INFORMED
SYNTHETIC baseline (documented limitation — real longitudinal ethanol-wear
datasets are not publicly available at scale). As consumer_fault_reports
accumulates real data, retrain_with_real_reports() blends it in.

Run:
    python -m ml_core.model_trainer --output ml_core/artifacts/risk_model.joblib
"""

import argparse
from pathlib import Path

import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
import joblib

from ml_core.feature_engineering import FEATURE_NAMES

ARTIFACT_DIR = Path(__file__).resolve().parent / "artifacts"


def _generate_synthetic_training_data(n_samples: int = 4000, seed: int = 42):
    """
    Literature-informed synthetic baseline. Relationships encoded here reflect
    ARAI's published qualitative findings (older + carburettor + low native
    tolerance + high usage -> lower health score), with noise added — NOT
    measured empirical data. See docs/ARCHITECTURE.md limitations section.
    """
    rng = np.random.default_rng(seed)

    vehicle_age = rng.uniform(0, 20, n_samples)
    native_tolerance = rng.choice([5, 10, 20], n_samples, p=[0.2, 0.5, 0.3])
    is_carburettor = rng.choice([0, 1], n_samples, p=[0.6, 0.4])
    monthly_km = rng.uniform(200, 3000, n_samples)
    humidity = rng.uniform(30, 80, n_samples)

    X = np.column_stack([vehicle_age, native_tolerance, is_carburettor, monthly_km, humidity])

    base = 100.0
    health_score = (
        base
        - vehicle_age * 3.2
        - is_carburettor * 14.0
        - (20 - native_tolerance) * 1.1
        - (monthly_km / 500.0)
        - (humidity - 50) * 0.15
        + rng.normal(0, 5, n_samples)
    )
    health_score = np.clip(health_score, 0, 100)

    return X, health_score


def train_risk_model(output_path: Path | None = None) -> GradientBoostingRegressor:
    X, y = _generate_synthetic_training_data()
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = GradientBoostingRegressor(
        n_estimators=150,
        max_depth=3,
        learning_rate=0.08,
        random_state=42,
    )
    model.fit(X_train, y_train)

    score = model.score(X_test, y_test)
    print(f"Validation R^2: {score:.3f} (synthetic data — see docs/ARCHITECTURE.md limitations)")

    output_path = output_path or (ARTIFACT_DIR / "risk_model.joblib")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": model, "feature_names": FEATURE_NAMES}, output_path)
    print(f"Saved model to {output_path}")
    return model


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=None)
    args = parser.parse_args()
    train_risk_model(args.output)
