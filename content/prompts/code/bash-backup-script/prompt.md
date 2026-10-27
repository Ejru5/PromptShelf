---
title: Safe nightly backup script
summary: A robust bash backup — dump, compress, checksum, upload, rotate — with dry-run mode and cron line.
category: code
models: [Claude, ChatGPT]
tags: [bash, devops, backups, cron]
difficulty: intermediate
created: 2026-09-06
settings:
  Language: Bash
blanks:
  what:
    label: What to back up
    default: a Postgres database and an uploads folder
  destination:
    label: Destination
    default: an S3 bucket
  keep_days:
    label: Keep local copies (days)
    default: "14"
results:
  - type: code
    file: output.sh
    filename: backup.sh
    model: Claude
---
Write a robust bash script that backs up {{what}} every night: dump, compress, write checksums, upload to {{destination}}, and delete local copies older than {{keep_days}} days. Use set -euo pipefail, an ERR trap that reports the line number, environment variables with defaults, a DRY_RUN mode, timestamped log lines, and include the crontab line.
