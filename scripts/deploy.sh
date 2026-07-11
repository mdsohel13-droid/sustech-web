#!/usr/bin/env bash
#
# deploy.sh — standard production deploy for the Sustech web app (run on the VPS).
#
# Order matters:
#  1. migrations run BEFORE the build, because the build prerenders pages that
#     query the database — if the schema is behind the code the build fails with
#     "column ... does not exist". Migrations keep the DB in lock-step with code.
#  2. the Next data cache (.next/cache) is cleared BEFORE the build, because
#     getSiteSettings/getNavigation are unstable_cache'd. A persisted cache makes
#     the build prerender pages with stale CMS data (e.g. a contact email added by
#     a migration wouldn't show until the 1h revalidate window). Clearing it makes
#     every deploy reflect current CMS content immediately.
#
# Usage:
#   ./scripts/deploy.sh [branch]      # default branch: main
#
set -euo pipefail

BRANCH="${1:-main}"
APP="sustech-web"

echo "==> [1/6] Fetch + checkout origin/$BRANCH"
git fetch origin
git reset --hard "origin/$BRANCH"

echo "==> [2/6] Install dependencies"
pnpm install --frozen-lockfile

echo "==> [3/6] Apply database migrations (idempotent; no-op if none pending)"
pnpm migrate

echo "==> [4/6] Clear stale Next data cache (so the build reads fresh CMS data)"
rm -rf .next/cache

echo "==> [5/6] Build"
pnpm build

echo "==> [6/6] Restart $APP + health check"
pm2 restart "$APP" --update-env
pm2 status "$APP"

sleep 6   # give the app a moment to come up
pnpm health   # non-zero exit here = something is red; investigate before walking away

echo "==> Deploy complete."
