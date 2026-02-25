#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR=${BACKUP_DIR:-"./backups"}
PGHOST=${PGHOST:-"localhost"}
PGPORT=${PGPORT:-"5432"}
PGUSER=${PGUSER:-"postgres"}
PGDATABASE=${PGDATABASE:-"YogaPlatformDb"}
export PGPASSWORD=${PGPASSWORD:-"postgres"}

mkdir -p "$BACKUP_DIR"
TS=$(date -u +"%Y%m%dT%H%M%SZ")
OUT_FILE="$BACKUP_DIR/${PGDATABASE}_${TS}.dump"

echo "Creating backup: $OUT_FILE"
pg_dump \
  --host "$PGHOST" \
  --port "$PGPORT" \
  --username "$PGUSER" \
  --format custom \
  --file "$OUT_FILE" \
  "$PGDATABASE"

echo "Backup completed: $OUT_FILE"
