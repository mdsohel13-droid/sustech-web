#!/usr/bin/env bash
#
# Sustech daily owner report (Lead Engine Phase 5) — a no-n8n stopgap that works
# from cron today. Pulls the server-aggregated metrics, emails them via Resend,
# and archives the rendered HTML in the daily-reports collection.
#
# Run from the web VPS at 08:00 Asia/Dhaka (see scripts/ops/crontab.txt).
# Requires env: PIPELINE_SECRET, RESEND_API_KEY, OWNER_NOTIFY_EMAIL.
# Optional: SITE_URL (defaults to the public site). Needs: curl, jq.
set -euo pipefail

BASE="${SITE_URL:-https://www.sustechltd.com}"
: "${PIPELINE_SECRET:?set PIPELINE_SECRET}"
: "${RESEND_API_KEY:?set RESEND_API_KEY}"
: "${OWNER_NOTIFY_EMAIL:?set OWNER_NOTIFY_EMAIL}"

DATA=$(curl -fsS -H "Authorization: Bearer $PIPELINE_SECRET" "$BASE/api/pipeline/report-data")
HTML=$(echo "$DATA" | jq -r '.html')
DATE=$(echo "$DATA" | jq -r '.metrics.date')

# 1) Email the report via Resend
curl -fsS -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" -H "Content-Type: application/json" \
  -d "$(jq -n --arg to "$OWNER_NOTIFY_EMAIL" --arg html "$HTML" --arg subj "Sustech — daily report ($DATE)" \
        '{from:"Sustech Reports <reports@sustechltd.com>", to:[$to], subject:$subj, html:$html}')" >/dev/null

# 2) Archive the rendered report (browsable in /admin even if email fails)
curl -fsS -X POST "$BASE/api/pipeline/daily-report" \
  -H "Authorization: Bearer $PIPELINE_SECRET" -H "Content-Type: application/json" \
  -d "$(echo "$DATA" | jq '{date: .metrics.date, html: .html, metrics: .metrics}')" >/dev/null

echo "daily-report sent + archived for $DATE"
