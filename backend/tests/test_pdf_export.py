"""Phase 6 test for PDF export."""

from services.pdf_export import generate_compatibility_pdf


def test_generates_valid_pdf_bytes():
    pdf_bytes = generate_compatibility_pdf(
        {
            "match_type": "verified", "make": "Tata", "model": "Nexon", "mfg_year": 2023,
            "emission_standard": "BS6-Phase2", "max_safe_ethanol_pct": 20, "confidence": "High",
            "source_reference": "Tata Motors public compliance statement",
        }
    )
    assert pdf_bytes[:4] == b"%PDF"
    assert len(pdf_bytes) > 500


def test_generates_pdf_without_risk_prediction():
    pdf_bytes = generate_compatibility_pdf(
        {"match_type": "estimated", "make": "X", "model": "Y", "mfg_year": 2010,
         "emission_standard": "BS3/BS4 transition", "max_safe_ethanol_pct": 10, "confidence": "Medium"}
    )
    assert pdf_bytes[:4] == b"%PDF"
