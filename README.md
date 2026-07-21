# E20-Shield — Fuel Compatibility Intelligence Platform

Evidence-based platform helping Indian vehicle owners check E20 (20% ethanol-blend)
fuel compatibility, understand component-wear risk, and see aggregated,
privacy-preserving regional trends from crowdsourced reports.

## Core design principle

Every piece of data shown to a user is tagged as exactly one of:

| Tag | Meaning | Example |
|---|---|---|
| **Verified** | Sourced from ARAI / manufacturer / government data | Exact match in `vehicle_registry_specs` |
| **Estimated** | Derived from the generic fallback rule engine | No exact vehicle match, estimate from manufacturing year |
| **User-reported** | Crowdsourced, self-reported, unverified | `consumer_fault_reports` |
| **Model prediction** | ML output, shown with a confidence interval | Risk score / months-to-service estimate |

The compatibility checker **never refuses an input**. Any make/model/year a user
types resolves to either a Verified exact match or an Estimated fallback result
(Section 5.1 of the architecture doc) — coverage is unbounded and grows via the
open vehicle-submission queue.

## Monorepo layout

```
e20-shield/
├── backend/     FastAPI + SQLAlchemy + Alembic + scikit-learn
├── frontend/    Next.js 15 + TypeScript + Tailwind + shadcn/ui
├── docs/        Architecture, API docs, data sources, problem statement
└── docker-compose.yml
```

## Build phases (see docs/ARCHITECTURE.md for full detail)

- [x] **Phase 1** — Repo scaffold, docker-compose, DB schema + migrations, bulk seed data
- [x] **Phase 2** — Trained GradientBoostingRegressor + SHAP explainability, replacing the rule-based placeholder
- [x] **Phase 3** — Next.js frontend shell + Compatibility Checker + Risk Predictor pages, wired to the live API
- [x] **Phase 4** — Report submission, privacy-thresholded aggregation service, regional dashboard (chart + table) + MapLibre component
- [x] **Phase 5** — React Three Fiber 3D educational visualization + policy transparency dashboard
- [x] **Phase 6** — Admin panel, PDF export (reportlab), Supabase JWT auth (fail-closed until configured)
- [x] **Phase 7** — 14 passing backend tests, CI workflow, deployment guide (docs/DEPLOYMENT.md)

### Known simplifications (documented, not hidden)

- The regional dashboard's primary view is a Recharts bar chart + table; the
  MapLibre `RegionalMap.tsx` component exists and works but needs a real
  district-centroid lookup table (`reports.py` currently uses a placeholder
  coordinate) to plot accurately — a natural next increment.
- `/export/report.pdf` currently re-derives the fallback estimate rather than
  reusing the exact `/vehicles/lookup` DB match — a straightforward dedup
  left as a follow-up (flagged in `routers/export.py`).
- Admin auth requires a real `SUPABASE_JWT_SECRET`; until configured, admin
  routes fail closed (503) rather than silently allowing access.
- Seed data source citations are pattern-level, not unique per row — see
  `docs/DATA_SOURCES.md` before using specific vehicles in your report.

## Quick start (local dev)

```bash
cp .env.example .env
docker compose up --build
# Backend:  http://localhost:8000/docs   (FastAPI Swagger UI)
# Frontend: http://localhost:3000
```

To (re)seed the reference vehicle database:

```bash
docker compose exec backend python seed_from_csv.py seed_data/vehicles_seed.csv
```

## License / academic use

Built as a final-year Computer Science project. All "Verified" data must cite
a public source (see `source_reference` column and `docs/DATA_SOURCES.md`).
Synthetic/literature-informed data used for ML training is clearly documented
as a limitation — see `docs/ARCHITECTURE.md`.
