"""Phase 6 tests for the auth dependency — fails closed when unconfigured."""

import pytest
from fastapi import HTTPException

from services.auth import _decode_token


def test_decode_fails_closed_without_configured_secret():
    """With no SUPABASE_JWT_SECRET set (test default), auth must refuse, not allow."""
    with pytest.raises(HTTPException) as exc_info:
        _decode_token("any-token-value")
    assert exc_info.value.status_code == 503
