#!/bin/sh
# Simple backup script for PostgreSQL (Local)

BACKUP_DIR="$(pwd)/Infra/backups"
DB_HOST="localhost"
DB_USER="postgres"
DB_NAME="YogaPlatformDb"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate filename with timestamp
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/backup_${DB_NAME}_${TIMESTAMP}.sql.gz"

echo "Starting backup of $DB_NAME to $BACKUP_FILE..."

# Run pg_dump (assuming password is 'postgres' based on previous commands)
PGPASSWORD=postgres pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "Backup completed successfully."
  
  # Keep only the last 7 days of backups
  echo "Cleaning up old backups..."
  find "$BACKUP_DIR" -type f -name "backup_${DB_NAME}_*.sql.gz" -mtime +7 -exec rm {} \;
  echo "Cleanup done."
else
  echo "Backup failed!"
  exit 1
fi
