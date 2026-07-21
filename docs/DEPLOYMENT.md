# Deployment Guide

Matches the free-tier architecture in Section 6 of the spec. All values are
environment variables — no code changes needed to swap a provider.

## Frontend → Cloudflare Pages (primary) / Vercel (fallback)

1. Connect your GitHub repo, set the build directory to `frontend/`.
2. Build command: `npm run build`, output: `.next` (Cloudflare's Next.js
   adapter) or use Vercel's native Next.js support directly.
3. Set `NEXT_PUBLIC_API_BASE_URL` to your deployed backend's `/api/v1` URL.

## Backend → Render (primary) / Fly.io / Railway (fallback)

1. New Web Service, point at `backend/`, Docker runtime (uses `backend/Dockerfile`).
2. Set env vars from `.env.example`: `DATABASE_URL` (Supabase connection
   string), `REDIS_URL`, `SUPABASE_*`, `APP_SECRET_KEY`, `CORS_ALLOWED_ORIGINS`
   (your frontend's deployed URL).
3. Run once after first deploy: `alembic upgrade head`, then
   `python seed_from_csv.py seed_data/vehicles_seed.csv`.

## Database → Supabase Postgres

1. Create a Supabase project, enable the PostGIS extension (Database →
   Extensions → postgis).
2. Copy the connection string into `DATABASE_URL` (use the `asyncpg`-style
   `postgresql+asyncpg://` prefix).
3. Copy `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and
   `SUPABASE_JWT_SECRET` from Project Settings → API.

## Background jobs → Render worker + Upstash/Redis Cloud free tier

Point `REDIS_URL` at your hosted Redis instance; deploy `celery_worker`
as a second Render service running `celery -A services.celery_app worker`.

## Monitoring / analytics (optional)

- Better Stack: set `BETTERSTACK_SOURCE_TOKEN`.
- PostHog: set `POSTHOG_API_KEY` / `POSTHOG_HOST`, wire into
  `frontend/src/app/layout.tsx` client-side.

## A note on free-tier limits

Free tiers change their pricing/limits over time. Because every value above
is an environment variable and both `backend/Dockerfile` and
`frontend/Dockerfile` are standard, any layer can be redeployed to a
different provider without touching application code — only the env vars
and where you point the deploy.
