# Problem Statement & Literature Survey (draft)

## Problem statement

India's nationwide rollout of E20 (20% ethanol-blended) petrol has created a
compatibility gap for the large share of vehicles manufactured before the
April 2023 BS6 Phase-2 mandate, which were engineered for a maximum of E10.
ARAI's own published findings document accelerated degradation of nitrile
rubber fuel lines, gaskets, and carburettor O-rings in legacy vehicles, plus
reduced fuel efficiency from ethanol's lower calorific value. Consumers face
ambiguity about their own vehicle's compatibility, and the information that
does exist is fragmented across manufacturer PDFs, news coverage, and
government notifications rather than consolidated in one accessible tool.

## Literature / existing-solutions survey

| Existing source | Offering | Shortcoming |
|---|---|---|
| Manufacturer websites | Static compliance statements | No lookup tool, no risk scoring |
| News coverage | One-off reporting | Not structured or queryable |
| ARAI reports | Authoritative technical data | Dense PDFs, not consumer-friendly |
| Government/PIB statements | Policy position | No citizen feedback loop |
| Social media | Real user pain points | Unstructured, unverifiable, not mapped |

## Research gap

No existing free, public tool combines (a) a structured vehicle-specific
lookup grounded in verifiable manufacturer/ARAI data, (b) a transparent,
confidence-scored ML risk estimate, and (c) an opt-in, clearly-labeled
crowdsourced reporting and regional-aggregation layer — while keeping fact,
estimate, and prediction visually and structurally distinct throughout.

## Target users

1. Vehicle owners checking compatibility and maintenance guidance
2. Mechanics/service centers referencing common failure patterns by model/year
3. Researchers/students accessing aggregated, anonymized trend data
4. Policy analysts viewing regional patterns and labeled cost-burden estimates
5. Insurance-curious users understanding what "incorrect fuel" claim denials
   typically relate to (informational only — not legal or financial advice)

## Scope note

This is a software-only, final-year Computer Science project — no embedded
hardware or IoT components. All "verified" claims are sourced from public
data; all predictions are model estimates shown with confidence intervals;
all user reports are clearly labeled as self-reported and unverified unless
independently confirmed.
