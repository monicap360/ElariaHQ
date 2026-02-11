#!/usr/bin/env bash
set -euo pipefail

DB_URL="${SUPABASE_DB_URL:-${DATABASE_URL:-}}"

if [[ -z "${DB_URL}" ]]; then
  echo "Missing SUPABASE_DB_URL (or DATABASE_URL)."
  echo "Example: export SUPABASE_DB_URL='postgresql://USER:PASSWORD@HOST:5432/postgres'"
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is required to run migrations."
  echo "Install PostgreSQL client tools, then retry."
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="${ROOT_DIR}/migrations"
SEED_DIR="${ROOT_DIR}/seed"
SAILINGS_SEED_FILE="${ROOT_DIR}/../cruise-cards-site/src/supporting-materials/sailings-seed.sql"

echo "Running migrations from ${MIGRATIONS_DIR}"
for file in "${MIGRATIONS_DIR}"/*.sql; do
  [[ -e "${file}" ]] || continue
  echo "Applying $(basename "${file}")"
  psql "${DB_URL}" -v ON_ERROR_STOP=1 -f "${file}"
done

echo "Running seed files from ${SEED_DIR}"
for file in "${SEED_DIR}"/*.sql; do
  [[ -e "${file}" ]] || continue
  echo "Seeding $(basename "${file}")"
  psql "${DB_URL}" -v ON_ERROR_STOP=1 -f "${file}"
done

if [[ -f "${SAILINGS_SEED_FILE}" ]]; then
  echo "Seeding ship and sail dates from $(basename "${SAILINGS_SEED_FILE}")"
  psql "${DB_URL}" -v ON_ERROR_STOP=1 -f "${SAILINGS_SEED_FILE}"
else
  echo "Skipping ship/sailings seed: file not found at ${SAILINGS_SEED_FILE}"
fi

echo "Verifying ships and sailings counts"
psql "${DB_URL}" -v ON_ERROR_STOP=1 -c \
  "select count(*) as total_ships from public.ships;"
psql "${DB_URL}" -v ON_ERROR_STOP=1 -c \
  "select count(*) as total_sailings from public.sailings;"
psql "${DB_URL}" -v ON_ERROR_STOP=1 -c \
  "select count(*) as future_galveston_sailings from public.sailings where departure_port = 'Galveston' and depart_date >= current_date;"

echo "Done."
