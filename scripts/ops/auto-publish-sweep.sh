#!/usr/bin/env bash
#
# Auto-publish sweep (Lead Engine Phase 4) — a no-n8n stopgap. Calls the guarded
# sweep route hourly and logs the JSON outcome. In shadow mode (the default,
# AUTO_PUBLISH_ENABLED=false) it publishes nothing and reports what it WOULD
# publish — exactly the log to review for ≥2 weeks before enabling.
#
# Requires env: PIPELINE_SECRET. Optional: SITE_URL.
set -euo pipefail

BASE="${SITE_URL:-https://www.sustechltd.com}"
: "${PIPELINE_SECRET:?set PIPELINE_SECRET}"

OUT=$(curl -fsS -X POST -H "Authorization: Bearer $PIPELINE_SECRET" "$BASE/api/pipeline/auto-publish-sweep")
echo "$(date -u +%FT%TZ) sweep: $OUT"
