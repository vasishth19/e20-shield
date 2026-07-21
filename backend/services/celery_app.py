"""
Celery application instance for background jobs (report aggregation,
PDF generation — Section 6). Tasks are added alongside the features that
need them (Phase 4 for aggregation, Phase 6 for PDF export).
"""

from celery import Celery

from config import get_settings

settings = get_settings()

celery_app = Celery(
    "e20shield",
    broker=settings.redis_url,
    backend=settings.redis_url,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
)
