"""
Generic fallback rule engine (Section 5.1).

Used by routers/vehicles.py whenever a make/model/year has no exact row in
`vehicle_registry_specs`. Requires nothing but the manufacturing year, so it
can NEVER fail to produce an answer — this is what guarantees the compatibility
checker never refuses an input.

Config lives in ml_core/degradation_reference.json specifically so it can be
corrected by a non-engineer (e.g. after a policy update) without a code deploy.
"""

import json
from functools import lru_cache
from pathlib import Path

CONFIG_PATH = Path(__file__).resolve().parents[1] / "ml_core" / "degradation_reference.json"


@lru_cache
def _load_config() -> dict:
    with CONFIG_PATH.open(encoding="utf-8") as f:
        return json.load(f)


class NoMatchingYearBandError(Exception):
    """Raised only if the config itself has a gap — should never happen in practice."""


def estimate_from_year(mfg_year: int) -> dict:
    """
    Return a dict shaped like a partial VehicleLookupResponse, tagged
    'estimated', purely from manufacturing year.
    """
    config = _load_config()

    for band in config["year_bands"]:
        if band["min_year"] <= mfg_year <= band["max_year"]:
            return {
                "emission_standard": band["assumed_standard"],
                "max_safe_ethanol_pct": band["max_safe_ethanol_pct"],
                "confidence": band["confidence"],
                "fuel_delivery_system": None,
                "fuel_tank_material": None,
                "source_reference": None,
            }

    # Defensive fallback: clamp to the nearest defined band rather than error out,
    # so a malformed/very-out-of-range year still returns *something* usable.
    bands = config["year_bands"]
    nearest = min(bands, key=lambda b: min(abs(mfg_year - b["min_year"]), abs(mfg_year - b["max_year"])))
    return {
        "emission_standard": nearest["assumed_standard"],
        "max_safe_ethanol_pct": nearest["max_safe_ethanol_pct"],
        "confidence": "Low",
        "fuel_delivery_system": None,
        "fuel_tank_material": None,
        "source_reference": None,
    }
