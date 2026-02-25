#!/usr/bin/env bash
set -euo pipefail

BACKUP_FILE=${1:-}
if [[ -z "$BACKUP_FILE" ]]; then
  LATEST=$(ls -1t "${BACKUP_DIR:-./backups}"/*.dump 2>/dev/null | head -n 1 || true)
  if [[ -z "$LATEST" ]]; then
    echo "No backup file provided and no backups found in ${BACKUP_DIR:-./backups}"
    exit 1
  fi
  BACKUP_FILE="$LATEST"
fi

if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "Backup file not found: $BACKUP_FILE"
  exit 1
fi

PGHOST=${PGHOST:-"localhost"}
PGPORT=${PGPORT:-"5432"}
PGUSER=${PGUSER:-"postgres"}
export PGPASSWORD=${PGPASSWORD:-"postgres"}

DRILL_DB=${DRILL_DB:-"YogaPlatformDrill_$(date +%s)"}

echo "[DRILL] Creating drill database: $DRILL_DB"
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"$DRILL_DB\";"

echo "[DRILL] Restoring backup into drill database"
bash "$(dirname "$0")/restore.sh" "$BACKUP_FILE" "$DRILL_DB"

echo "[DRILL] Running verification query"
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$DRILL_DB" -v ON_ERROR_STOP=1 -c "SELECT NOW() as restored_at;"

echo "[DRILL] Cleanup drill database"
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d postgres -v ON_ERROR_STOP=1 -c "DROP DATABASE \"$DRILL_DB\";"

echo "[DRILL] Success: backup restore drill completed"
