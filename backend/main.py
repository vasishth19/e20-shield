"""
E20-Shield backend entrypoint.

Phase 1 scope: app wiring only. Routers are stubbed in Phase 1 and filled in
during Phase 2 (see routers/vehicles.py for the search/lookup/submit endpoints
and the fallback rule engine integration).
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from config import get_settings
from routers import export, policy, predictions, reports, spatial, vehicles

settings = get_settings()

limiter = Limiter(key_func=get_remote_address, default_limits=[f"{settings.rate_limit_per_minute}/minute"])

app = FastAPI(
    title="E20-Shield API",
    description=(
        "Fuel Compatibility Intelligence Platform for India's E20 transition. "
        "Every response is tagged as Verified, Estimated, User-reported, or a "
        "Model prediction — never presented as undifferentiated fact."
    ),
    version="0.1.0",
    openapi_url="/api/v1/openapi.json",
    docs_url="/docs",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vehicles.router, prefix=settings.api_v1_prefix, tags=["vehicles"])
app.include_router(predictions.router, prefix=settings.api_v1_prefix, tags=["predictions"])
app.include_router(reports.router, prefix=settings.api_v1_prefix, tags=["reports"])
app.include_router(spatial.router, prefix=settings.api_v1_prefix, tags=["spatial"])
app.include_router(policy.router, prefix=settings.api_v1_prefix, tags=["policy"])
app.include_router(export.router, prefix=settings.api_v1_prefix, tags=["export"])


@app.get("/", tags=["health"])
async def root():
    return {
        "service": "E20-Shield API",
        "status": "ok",
        "docs": "/docs",
    }


@app.get("/health", tags=["health"])
async def health():
    return {"status": "healthy"}
