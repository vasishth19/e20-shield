#!/bin/sh
set -e

echo ">>> Running database migrations..."
alembic upgrade head

echo ">>> Seeding reference vehicle data (safe to re-run — duplicates are skipped)..."
python seed_from_csv.py seed_data/vehicles_seed.csv || echo "Seed step failed or already seeded — continuing anyway."

echo ">>> Starting API server..."
exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
