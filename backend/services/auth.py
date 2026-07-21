"""
Supabase JWT verification + role-check dependency (Phase 6).

Supabase issues standard JWTs signed with SUPABASE_JWT_SECRET. This module
verifies that signature and exposes a `require_admin` FastAPI dependency for
admin-only routes (e.g. vehicle submission approval).

NOTE: requires a real SUPABASE_JWT_SECRET in .env to function against actual
Supabase-issued tokens. Until Supabase is configured, admin routes should be
protected at the infrastructure level (e.g. not publicly exposed) — this
module fails closed (raises 401) rather than silently allowing access if the
secret is unset.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from config import get_settings

settings = get_settings()
bearer_scheme = HTTPBearer(auto_error=False)


def _decode_token(token: str) -> dict:
    if not settings.supabase_jwt_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Auth not configured (SUPABASE_JWT_SECRET missing) — admin routes are disabled.",
        )
    try:
        return jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired token") from exc


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Missing bearer token")
    return _decode_token(credentials.credentials)


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    role = (user.get("user_metadata") or {}).get("role") or user.get("role")
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin role required")
    return user
