#!/bin/sh

# Usage: sh backup-before-company-profile-migration.sh
# Dumps the current Postgres DB to a timestamped file in the backups directory

set -e

BACKUP_DIR="../backups"
TIMESTAMP=$(date +"%Y-%m-%dT%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/database-backup-before-company-profile-$TIMESTAMP.sql"

mkdir -p "$BACKUP_DIR"

# You may need to adjust these variables for your environment
PGUSER="${PGUSER:-voltbay_user}"
PGDATABASE="${PGDATABASE:-voltbay}"
PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"

# Export password if needed
# export PGPASSWORD=your_password_here

pg_dump -U "$PGUSER" -h "$PGHOST" -p "$PGPORT" -d "$PGDATABASE" -F c -b -v -f "$BACKUP_FILE"

echo "Database backup complete: $BACKUP_FILE" 