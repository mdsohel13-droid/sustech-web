import "./load-env";
import path from "path";
import { createJiti } from "jiti";
import { generateImportMap } from "payload";
import type { SanitizedConfig } from "payload";

// Regenerate app/(payload)/admin/importMap.js from the Payload config.
// Payload normally rewrites this on dev boot, but `next build` does not — so the
// file must be generated and committed for the production admin (richtext/Lexical
// RSC + client components) to resolve. The Payload CLI is broken on Node 24 on this
// host, so we call the exported generator directly via jiti (same pattern as gen-types.ts).
async function main(): Promise<void> {
  const jiti = createJiti(import.meta.url, { interopDefault: true });
  const config = await jiti.import<SanitizedConfig>(path.resolve("payload.config.ts"), {
    default: true,
  });
  await generateImportMap(await config, { log: true });
}
main().catch((e) => {
  console.error("FAIL:", e?.message?.split("\n")[0]);
  process.exit(1);
});
