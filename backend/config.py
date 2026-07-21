"""
Centralized application configuration.

All values are read from environment variables (see .env.example at repo root).
Never hardcode secrets here — this file only defines shape + sane local defaults.
"""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # --- App ---
    app_env: str = "development"
    app_secret_key: str = "dev-only-change-me"
    api_v1_prefix: str = "/api/v1"

    # --- Database ---
    database_url: str = (
        "postgresql+asyncpg://e20user:e20pass@localhost:5432/e20shield"
    )

    # --- Redis / Celery ---
    redis_url: str = "redis://localhost:6379/0"

    # --- Supabase ---
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    supabase_jwt_secret: str = ""
    supabase_storage_bucket: str = "e20-shield-exports"

    # --- CORS ---
    cors_allowed_origins: str = "http://localhost:3000"

    # --- Rate limiting ---
    rate_limit_per_minute: int = 60

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_allowed_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    """Settings are cached — env vars are read once per process."""
    return Settings()
