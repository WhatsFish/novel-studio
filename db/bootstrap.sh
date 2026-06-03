#!/usr/bin/env bash
# Bootstrap the novel_studio Postgres role + DB inside the shared
# traffic-monitor-db-1 container, then apply schema.sql.
#
# Idempotent: safe to re-run. Reads NOVEL_PG_PASSWORD from the env file
# at /home/liharr/.config/novel-studio.env (mode 600). Run from repo root.
set -euo pipefail

ENV_FILE="${NOVEL_ENV_FILE:-/home/liharr/.config/novel-studio.env}"
DB_CONTAINER="${NOVEL_DB_CONTAINER:-traffic-monitor-db-1}"
SCHEMA_FILE="$(dirname "$0")/schema.sql"

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: $ENV_FILE not found. Create it with NOVEL_PG_PASSWORD=..." >&2
  exit 1
fi
# shellcheck disable=SC1090
source "$ENV_FILE"

if [ -z "${NOVEL_PG_PASSWORD:-}" ]; then
  echo "ERROR: NOVEL_PG_PASSWORD not set in $ENV_FILE" >&2
  exit 1
fi

# Step 1: create role + database. The shared db container's superuser is
# `umami`; reuse it (not `postgres`).
docker exec -i "$DB_CONTAINER" psql -U umami -d umami <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'novel_studio') THEN
    CREATE ROLE novel_studio WITH LOGIN PASSWORD '${NOVEL_PG_PASSWORD}';
  END IF;
END
\$\$;

SELECT 'CREATE DATABASE novel_studio OWNER novel_studio'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'novel_studio')\gexec

GRANT ALL PRIVILEGES ON DATABASE novel_studio TO novel_studio;
SQL

# Step 2: apply schema as the owner role.
docker exec -i -e PGPASSWORD="$NOVEL_PG_PASSWORD" "$DB_CONTAINER" \
  psql -h localhost -U novel_studio -d novel_studio < "$SCHEMA_FILE"

echo "novel_studio bootstrap complete."
