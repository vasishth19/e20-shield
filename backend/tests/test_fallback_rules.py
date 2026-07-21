"""
Phase 1 sanity tests for the fallback rule engine — the piece of logic that
guarantees /vehicles/lookup can never fail to answer.
"""

import pytest

from services.fallback_rules import estimate_from_year


@pytest.mark.parametrize(
    "year,expected_standard_substring",
    [
        (2005, "BS3"),
        (2013, "transition"),
        (2018, "BS4"),
        (2021, "Phase 1"),
        (2024, "Phase 2"),
    ],
)
def test_estimate_from_year_covers_all_bands(year, expected_standard_substring):
    result = estimate_from_year(year)
    assert expected_standard_substring in result["emission_standard"]
    assert 0 <= result["max_safe_ethanol_pct"] <= 100
    assert result["confidence"] in {"Low", "Medium", "Medium-High", "High"}


def test_estimate_from_year_never_raises_for_extreme_years():
    """Even absurd/out-of-range years must return *something*, never an error."""
    for year in (1850, 2200):
        result = estimate_from_year(year)
        assert result["emission_standard"]
        assert result["max_safe_ethanol_pct"] > 0


def test_recent_vehicle_gets_e20_rating():
    result = estimate_from_year(2024)
    assert result["max_safe_ethanol_pct"] == 20
    assert result["confidence"] == "High"


def test_pre_2010_vehicle_gets_low_confidence():
    result = estimate_from_year(2005)
    assert result["confidence"] == "Low"
    assert result["max_safe_ethanol_pct"] == 5
