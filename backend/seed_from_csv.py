"""
Bulk-seed `vehicle_registry_specs` from a CSV file.

Usage:
    python seed_from_csv.py seed_data/vehicles_seed.csv
    python seed_from_csv.py seed_data/vehicles_seed.csv --truncate   # wipe table first

This is the realistic alternative to hand-writing individual INSERT statements
(Section 7). The CSV shipped in seed_data/ covers ~140+ real Indian makes/models
across manufacturing-year bands — an accuracy head start for common searches,
NOT a limit on what the platform supports (see fallback rule engine for
everything else: services/fallback_rules.py).

Every row must carry a `source_reference` citation — rows without one are
rejected, because "bulk" doesn't mean "uncited".
"""

import argparse
import asyncio
import csv
import sys
from pathlib import Path

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from database import AsyncSessionLocal
from models import VehicleRegistrySpec

REQUIRED_COLUMNS = {
    "make", "model", "mfg_year", "emission_standard", "fuel_delivery_system",
    "fuel_tank_material", "max_safe_ethanol_pct", "source_reference",
}


def read_csv_rows(csv_path: Path) -> list[dict]:
    with csv_path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        missing = REQUIRED_COLUMNS - set(reader.fieldnames or [])
        if missing:
            sys.exit(f"CSV is missing required columns: {sorted(missing)}")

        rows = []
        for i, raw in enumerate(reader, start=2):  # header is line 1
            if not raw.get("source_reference", "").strip():
                sys.exit(f"Row {i} ({raw.get('make')} {raw.get('model')}) has no source_reference — rejected.")
            rows.append(raw)
        return rows


async def upsert_rows(session: AsyncSession, rows: list[dict]) -> tuple[int, int]:
    inserted, skipped = 0, 0
    for raw in rows:
        make, model, mfg_year = raw["make"].strip(), raw["model"].strip(), int(raw["mfg_year"])

        existing = await session.execute(
            select(VehicleRegistrySpec).where(
                VehicleRegistrySpec.make == make,
                VehicleRegistrySpec.model == model,
                VehicleRegistrySpec.mfg_year == mfg_year,
            )
        )
        if existing.scalar_one_or_none() is not None:
            skipped += 1
            continue

        session.add(
            VehicleRegistrySpec(
                make=make,
                model=model,
                mfg_year=mfg_year,
                emission_standard=raw["emission_standard"].strip(),
                fuel_delivery_system=raw["fuel_delivery_system"].strip(),
                fuel_tank_material=raw["fuel_tank_material"].strip(),
                max_safe_ethanol_pct=int(raw["max_safe_ethanol_pct"]),
                source_reference=raw["source_reference"].strip(),
            )
        )
        inserted += 1

    await session.commit()
    return inserted, skipped


async def main(csv_path: Path, truncate: bool) -> None:
    rows = read_csv_rows(csv_path)
    print(f"Loaded {len(rows)} rows from {csv_path}")

    async with AsyncSessionLocal() as session:
        if truncate:
            await session.execute(delete(VehicleRegistrySpec))
            await session.commit()
            print("Existing vehicle_registry_specs rows truncated.")

        inserted, skipped = await upsert_rows(session, rows)
        print(f"Done. Inserted {inserted} new rows, skipped {skipped} exact duplicates.")
        print(
            "Reminder: this seed data is a head start for common searches — anything not "
            "covered here still resolves via the fallback rule engine (Section 5.1), and can "
            "be added permanently through the /api/v1/vehicles/submit-unlisted queue."
        )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("csv_path", type=Path, help="Path to the seed CSV file")
    parser.add_argument("--truncate", action="store_true", help="Wipe the table before seeding")
    args = parser.parse_args()

    if not args.csv_path.exists():
        sys.exit(f"CSV file not found: {args.csv_path}")

    asyncio.run(main(args.csv_path, args.truncate))
