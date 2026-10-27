#!/usr/bin/env bash
# Nightly backup: Postgres dump + uploads folder → compressed, rotated, synced to S3.
# Usage: ./backup.sh            (uses defaults below)
#        DRY_RUN=1 ./backup.sh  (print what would happen)
set -euo pipefail

DB_URL="${DATABASE_URL:?DATABASE_URL is required}"
UPLOADS_DIR="${UPLOADS_DIR:-/var/www/app/uploads}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/app}"
S3_BUCKET="${S3_BUCKET:-s3://acme-backups/app}"
KEEP_DAYS="${KEEP_DAYS:-14}"
STAMP="$(date -u +%Y-%m-%dT%H%M%SZ)"
LOG() { printf '[%s] %s\n' "$(date -u +%H:%M:%S)" "$*"; }
RUN() { if [[ "${DRY_RUN:-0}" == 1 ]]; then echo "DRY: $*"; else "$@"; fi; }

trap 'LOG "❌ backup failed on line $LINENO"; exit 1' ERR

mkdir -p "$BACKUP_DIR"
cd "$BACKUP_DIR"

LOG "Dumping database…"
RUN pg_dump --format=custom --no-owner --dbname="$DB_URL" --file="db-$STAMP.dump"

LOG "Archiving uploads…"
RUN tar --zstd -cf "uploads-$STAMP.tar.zst" -C "$(dirname "$UPLOADS_DIR")" "$(basename "$UPLOADS_DIR")"

LOG "Writing checksums…"
RUN sha256sum "db-$STAMP.dump" "uploads-$STAMP.tar.zst" > "SHA256SUMS-$STAMP"

LOG "Syncing to $S3_BUCKET…"
RUN aws s3 cp "db-$STAMP.dump" "$S3_BUCKET/$STAMP/" --only-show-errors
RUN aws s3 cp "uploads-$STAMP.tar.zst" "$S3_BUCKET/$STAMP/" --only-show-errors
RUN aws s3 cp "SHA256SUMS-$STAMP" "$S3_BUCKET/$STAMP/" --only-show-errors

LOG "Removing local backups older than $KEEP_DAYS days…"
RUN find "$BACKUP_DIR" -maxdepth 1 -type f -mtime +"$KEEP_DAYS" -print -delete

LOG "✅ Done: $STAMP ($(du -sh "$BACKUP_DIR" | cut -f1) on disk)"

# Cron (02:30 UTC daily):
# 30 2 * * * DATABASE_URL=... /opt/scripts/backup.sh >> /var/log/app-backup.log 2>&1
