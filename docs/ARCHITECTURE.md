# E20-Shield — System Architecture

## 1. High-level component diagram

```
                        ┌─────────────────────────┐
                        │        Frontend          │
                        │  Next.js 15 + TypeScript  │
                        │  Tailwind + shadcn/ui     │
                        │  React Three Fiber, Maps  │
                        └────────────┬──────────────┘
                                     │ HTTPS / JSON
                        ┌────────────▼──────────────┐
                        │        Backend API         │
                        │   FastAPI (async, Pydantic)│
                        │  /api/v1/vehicles          │
                        │  /api/v1/predict           │
                        │  /api/v1/reports           │
                        │  /api/v1/spatial           │
                        │  /api/v1/policy            │
                        └──┬───────────┬─────────────┘
                           │           │
                 ┌─────────▼──┐   ┌────▼─────────┐
                 │ PostgreSQL │   │ Celery+Redis │
                 │ + PostGIS  │   │ (bg jobs)     │
                 └────────────┘   └───────────────┘
```

## 2. The three-tier data-labeling principle

Every fact shown to a user carries exactly one tag:

- **Verified** — exact row in `vehicle_registry_specs`, always carries a `source_reference` citation.
- **Estimated** — produced by the fallback rule engine (`services/fallback_rules.py`) from manufacturing year alone. Confidence level is always shown alongside.
- **User-reported** — from `consumer_fault_reports`, always `is_verified = false` unless independently confirmed by an admin.
- **Model prediction** — from `/predict/risk-score`, always shown with a confidence interval and a "not a diagnosis" disclaimer.

This isn't cosmetic — it's the backbone of the academic defensibility of the
project: nothing is presented as fact unless it can be traced to a citable
public source.

## 3. Why coverage is unbounded

`vehicle_registry_specs` has no row cap. The compatibility checker's
`/vehicles/lookup` endpoint has exactly two code paths:

1. Exact match found → return it, tagged Verified.
2. No match → call `estimate_from_year()`, which only needs a manufacturing
   year (a fact every user knows) and is guaranteed to return a result for
   any year, tagged Estimated.

There is no third path that returns "not found" or an error. Combined with
the open `vehicle_submission_queue`, the reference table can grow to any
size over time without a redeploy — see `seed_from_csv.py` for the bulk
import mechanism used at launch (~140+ real Indian makes/models across
manufacturing-year bands).

## 4. Limitations & ethical considerations (for academic submission)

- **Synthetic ML training data**: real longitudinal ethanol-wear datasets are
  not publicly available at the scale needed to train a robust regressor.
  The Phase 2 model is trained on a literature-informed synthetic baseline,
  blended with aggregated crowdsourced reports as the platform matures. This
  is documented, not hidden, and every prediction ships with a confidence
  interval and an explicit "estimate, not diagnosis" disclaimer.
- **Privacy-by-design for location data**: `consumer_fault_reports.approx_location`
  stores district-centroid coordinates only, never a user's exact address or
  GPS fix. The `/spatial/clusters` endpoint additionally enforces a
  minimum-report-count threshold per region (default 5, see
  `services/aggregation.py`) before that region is included in any response,
  to prevent re-identification of individual reporters.
- **Fact/opinion/prediction labeling**: enforced structurally, not just in
  copy — the `MatchType` and equivalent enums exist in the schema layer
  itself (`models/schemas.py`), so it's not possible for a route to return
  an estimated value without the `estimated` tag attached.
- **Free-tier infrastructure**: deployment targets (Render, Cloudflare Pages,
  Supabase free tier) can change limits or pricing. All provider-specific
  values are environment variables (`.env`), so any layer can be swapped
  without touching application code.

## 5. Build phases

See `README.md` for the phase checklist. Each phase is expected to be
reviewed and confirmed working before the next begins, per the project's
own build instructions.
