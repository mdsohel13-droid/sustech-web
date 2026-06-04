import { existsSync, readFileSync } from "fs";

// Load .env(.local) into process.env for standalone scripts (run via jiti, outside Next).
// CI sets these directly, so existing process.env values always win.
for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const raw of readFileSync(file, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    const hash = val.indexOf(" #");
    if (hash !== -1) val = val.slice(0, hash).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}
