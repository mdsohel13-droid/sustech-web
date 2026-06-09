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
// A read on the global + each collection forces the reconciled schema to be hit,
// surfacing any problem immediately rather than at first request.
await payload.findGlobal({ slug: "site-settings" });
for (const c of ["knowledge-resources", "awards", "partners", "job-openings"] as const) {
  await payload.count({ collection: c });
}
process.stdout.write("✓ Schema sync complete — site-settings + collections reachable.\n");
process.exit(0);
