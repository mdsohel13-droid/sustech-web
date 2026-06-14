/**
 * db:sync — force Payload to reconcile the database schema with the code.
 *
 * Payload runs a schema "push" during init when push is enabled. In production
 * push is OFF, so run this with PAYLOAD_DB_PUSH=true to apply ADDITIVE schema
 * changes (new columns/tables/enum-values) when you don't have a migration yet:
 *
 *     PAYLOAD_DB_PUSH=true pnpm db:sync
 *
 * It is safe to re-run (idempotent: already-present objects are skipped) and it
 * only ADDS — it never drops, because the code only ever adds fields here.
 *
 * Prefer committed migrations (`pnpm migrate`) for routine deploys; this is the
 * bridge for adopting migrations on a push-created database, and an escape hatch.
 */
import "./load-env";
import { getPayload } from "payload";
import config from "../../payload.config";

const payload = await getPayload({ config });
// Use find (limit 1), NOT count: count(*) ignores most columns, so it would pass
// even when a recently-added column is missing. find SELECTs every column, so a
// schema gap (e.g. a missing knowledge_resources.open_mode) throws HERE instead
// of silently surfacing later as an empty page.
await payload.findGlobal({ slug: "site-settings" });
for (const c of [
  "knowledge-resources",
  "awards",
  "partners",
  "job-openings",
  "team",
  "projects",
] as const) {
  await payload.find({ collection: c, limit: 1, depth: 0 });
}
process.stdout.write("✓ Schema sync complete — globals + collections fully readable.\n");
process.exit(0);
