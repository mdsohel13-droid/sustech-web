/**
 * icons:3d — load a free, MIT-licensed 3D icon set and attach it to services.
 *
 * Source: Microsoft "Fluent Emoji" 3D assets (github.com/microsoft/fluentui-emoji,
 * MIT license — free for commercial use). Each of the 10 service lines gets a
 * field-relevant 3D PNG (transparent background) uploaded into the Media
 * library and set as that service's `customIcon`. The site renders it via
 * <EntityIcon> with the built-in SVG as fallback.
 *
 * Idempotent: services that already have a customIcon are skipped, and media
 * is reused by alt-text match instead of duplicated. Safe to re-run.
 *
 * Run:   pnpm icons:3d
 */
import "./load-env";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { getPayload } from "payload";
import config from "../../payload.config";

const BASE = "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets";

/** service slug → [Fluent asset path, media alt text] */
const ICONS: Record<string, [string, string]> = {
  "solar-renewable": ["Sun/3D/sun_3d.png", "3D sun icon — solar & renewable energy"],
  "bess-storage": ["Battery/3D/battery_3d.png", "3D battery icon — BESS & energy storage"],
  "lps-earthing": [
    "High voltage/3D/high_voltage_3d.png",
    "3D lightning bolt icon — lightning protection & earthing",
  ],
  "electrical-epc": [
    "Electric plug/3D/electric_plug_3d.png",
    "3D electric plug icon — electrical & EPC works",
  ],
  "inspection-testing": [
    "Thermometer/3D/thermometer_3d.png",
    "3D thermometer icon — inspection, testing & thermography",
  ],
  "substation-hv": ["Gear/3D/gear_3d.png", "3D gear icon — substation & HV works"],
  "fire-safety": ["Fire/3D/fire_3d.png", "3D flame icon — fire & safety systems"],
  "lighting-distribution": [
    "Light bulb/3D/light_bulb_3d.png",
    "3D light bulb icon — lighting & product supply",
  ],
  "training-safety": [
    "Graduation cap/3D/graduation_cap_3d.png",
    "3D graduation cap icon — OH&S training",
  ],
  consultancy: ["Clipboard/3D/clipboard_3d.png", "3D clipboard icon — consultancy & compliance"],
};

const payload = await getPayload({ config });
const tmp = mkdtempSync(path.join(tmpdir(), "sustech-3d-"));
let attached = 0;
let skipped = 0;

for (const [slug, [asset, alt]] of Object.entries(ICONS)) {
  const { docs } = await payload.find({
    collection: "services",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  });
  const service = docs[0];
  if (!service) {
    process.stdout.write(`- ${slug}: service not found, skipped\n`);
    continue;
  }
  if (service.customIcon != null) {
    skipped += 1;
    continue;
  }

  // Reuse an already-uploaded copy (idempotency), else download + create.
  let mediaId: number;
  const existing = await payload.find({
    collection: "media",
    where: { alt: { equals: alt } },
    limit: 1,
    depth: 0,
  });
  if (existing.docs[0]) {
    mediaId = existing.docs[0].id;
  } else {
    const url = `${BASE}/${asset.replaceAll(" ", "%20")}`;
    const res = await fetch(url);
    if (!res.ok) {
      process.stdout.write(`- ${slug}: download failed (HTTP ${res.status}), skipped\n`);
      continue;
    }
    const file = path.join(tmp, path.basename(asset));
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    const media = await payload.create({
      collection: "media",
      filePath: file,
      data: { alt, caption: "Microsoft Fluent Emoji (MIT license)" },
    });
    mediaId = media.id;
  }

  await payload.update({
    collection: "services",
    id: service.id,
    data: { customIcon: mediaId },
  });
  attached += 1;
  process.stdout.write(`✓ ${slug} → ${path.basename(asset)}\n`);
}

process.stdout.write(`Done. attached: ${attached}, already set (skipped): ${skipped}\n`);
process.exit(0);
