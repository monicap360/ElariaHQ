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

echo "Done."
