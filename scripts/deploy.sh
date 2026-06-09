#!/usr/bin/env bash
#
# deploy.sh — standard production deploy for the Sustech web app (run on the VPS).
#
# Order matters: migrations run BEFORE the build, because the build prerenders
# pages that query the database — if the schema is behind the code, the build
# fails with "column ... does not exist". Applying committed migrations first
# keeps the database in lock-step with the code, so drift can never hide data.
#
# Usage:
#   ./scripts/deploy.sh [branch]      # default branch: feat/ui-improvements
#
set -euo pipefail

BRANCH="${1:-feat/ui-improvements}"
APP="sustech-web"

echo "==> [1/5] Fetch + checkout origin/$BRANCH"
git fetch origin
git reset --hard "origin/$BRANCH"

echo "==> [2/5] Install dependencies"
pnpm install --frozen-lockfile

echo "==> [3/5] Apply database migrations (idempotent; no-op if none pending)"
pnpm migrate

echo "==> [4/5] Build"
pnpm build

echo "==> [5/6] Restart $APP"
pm2 restart "$APP" --update-env
pm2 status "$APP"

echo "==> [6/6] Post-deploy health check"
sleep 6   # give the app a moment to come up
pnpm health   # non-zero exit here = something is red; investigate before walking away

echo "==> Deploy complete."
