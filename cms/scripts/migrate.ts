/**
 * pnpm migrate — apply pending DB migrations.
 *
 * The bundled `payload migrate` CLI fails to load the TS config on the VPS
 * (jiti/tsx → ERR_METHOD_NOT_IMPLEMENTED), which forced manual SQL. This script
 * runs the adapter's migrate() directly through the SAME jiti loader that
 * generate:types uses (proven reliable across Node versions), so deploys can
 * apply committed migrations without hand-written SQL.
 *
 * In production `push` is OFF, so only the committed migrations change the
 * schema. PAYLOAD_MIGRATING tells Payload not to auto-push during init.
 */
import "./load-env";
import path from "path";
import { createJiti } from "jiti";

process.env.PAYLOAD_MIGRATING = "true";

type PayloadLike = {
  init: (args: { config: unknown; disableOnInit?: boolean }) => Promise<void>;
  db: {
    migrate: () => Promise<void>;
    pool?: { query: (text: string) => Promise<unknown> };
  };
};

async function main(): Promise<void> {
  const jiti = createJiti(import.meta.url, { interopDefault: true });
  const config = await jiti.import(path.resolve("payload.config.ts"), { default: true });
  const mod = (await jiti.import("payload")) as Record<string, unknown>;
  const payload = (mod.default ?? mod) as PayloadLike;

  await payload.init({ config, disableOnInit: true });

  // Payload's migrate() records into payload_migrations via the create op but
  // does NOT create that table itself (init/push normally does). With push OFF
  // in production it may be absent on a first run, so ensure it exists. Matches
  // Payload's own columns; safe and idempotent.
  if (payload.db.pool?.query) {
    await payload.db.pool.query(
      'CREATE TABLE IF NOT EXISTS "payload_migrations" (' +
        '"id" serial PRIMARY KEY, "name" varchar, "batch" numeric, ' +
        '"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL, ' +
        '"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL)',
    );

    // Remove the dev-push marker (batch = -1). If present, Payload's migrate()
    // shows an interactive "you've run in dev mode" prompt that auto-cancels in a
    // non-interactive deploy → migrations silently never apply. Our migrations are
    // idempotent/guarded, so clearing it and applying them is safe.
    await payload.db.pool.query('DELETE FROM "payload_migrations" WHERE "batch" = -1');
  }

  await payload.db.migrate();
  process.stdout.write("✓ Migrations applied.\n");
  process.exit(0);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? (err.stack ?? err.message) : String(err);
  process.stderr.write("Migration failed: " + msg + "\n");
  process.exit(1);
});
