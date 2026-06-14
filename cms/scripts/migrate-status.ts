/**
 * pnpm migrate:status — show applied vs pending migrations.
 * Uses the same jiti loader as migrate.ts (the bundled `payload` CLI's loader
 * is broken on the VPS).
 */
import "./load-env";
import path from "path";
import { createJiti } from "jiti";

process.env.PAYLOAD_MIGRATING = "true";

type PayloadLike = {
  init: (args: { config: unknown; disableOnInit?: boolean }) => Promise<void>;
  db: { migrateStatus: () => Promise<void> };
};

async function main(): Promise<void> {
  const jiti = createJiti(import.meta.url, { interopDefault: true });
  const config = await jiti.import(path.resolve("payload.config.ts"), { default: true });
  const mod = (await jiti.import("payload")) as Record<string, unknown>;
  const payload = (mod.default ?? mod) as PayloadLike;

  await payload.init({ config, disableOnInit: true });
  await payload.db.migrateStatus();
  process.exit(0);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? (err.stack ?? err.message) : String(err);
  process.stderr.write("migrate:status failed: " + msg + "\n");
  process.exit(1);
});
