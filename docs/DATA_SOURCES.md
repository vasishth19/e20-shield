# Data Sources

All rows in `vehicle_registry_specs` must carry a `source_reference`. This
document tracks the categories of public source used, and the citation
format expected in the database column and in the final report.

## Categories used

1. **ARAI (Automotive Research Association of India)** — published emission
   standard rollout schedules and technical bulletins on ethanol-blend
   compatibility and material degradation studies.
2. **Manufacturer public compliance statements** — press releases, owner's
   manual notes, and public statements from Maruti Suzuki, Hyundai, Tata,
   Mahindra, Honda, TVS, Bajaj, Hero, Royal Enfield, Kia, Toyota, and others
   regarding BS-standard compliance and fuel compatibility for specific
   models/years.
3. **Government / PIB (Press Information Bureau) notifications** — official
   policy statements on the E20 rollout timeline and BS-VI mandate dates.
4. **News coverage** (NDTV, Autocar India, Times of India, etc.) — used only
   to corroborate dates/figures already present in an official source, never
   as the sole citation for a "Verified" row.

## Citation format in `source_reference`

```
<Manufacturer/Org> <document type> — <topic>, accessed <date>
```

Example: `Hyundai India public compliance statement — i20 BS6 emission
standard, ARAI rollout schedule reference`

## Seed data disclosure

The bulk seed CSV (`backend/seed_data/vehicles_seed.csv`) was generated
programmatically for Phase 1 to give ~140+ common Indian makes/models a
head start on exact-match resolution. Each row's `source_reference` cites
the *pattern* source (manufacturer compliance statement class + ARAI
rollout schedule for that emission standard) rather than a unique per-row
citation, because individual model/year technical bulletins are not all
independently public. **Before final submission, spot-check and replace
`source_reference` values for the vehicles you highlight in your report
with specific, checkable citations** (e.g., an actual ARAI bulletin URL or
manufacturer press release link) — do not present the placeholder pattern
text as an individually-verified citation in your academic writeup.

## Fallback rule engine sources

See `backend/ml_core/degradation_reference.json` → `"sources"` field:
MoRTH BS-VI notification timeline, ARAI published rollout schedule, and
aggregated (non-vehicle-specific) manufacturer compliance patterns.
