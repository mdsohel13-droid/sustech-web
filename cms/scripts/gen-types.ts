import "./load-env";
import { createRequire } from "module";
import path from "path";
import { pathToFileURL } from "url";
import { createJiti } from "jiti";

async function main(): Promise<void> {
  const jiti = createJiti(import.meta.url, { interopDefault: true });
  const config = await jiti.import<unknown>(path.resolve("payload.config.ts"), { default: true });
  const require = createRequire(import.meta.url);
  const file = path.join(path.dirname(require.resolve("payload")), "bin", "generateTypes.js");
  const mod = (await jiti.import(pathToFileURL(file).href)) as {
    generateTypes: (c: unknown, o?: { log: boolean }) => Promise<void>;
  };
  await mod.generateTypes(await config, { log: true });
}
main().catch((e) => {
  console.error("FAIL:", e?.message?.split("\n")[0]);
  process.exit(1);
});
