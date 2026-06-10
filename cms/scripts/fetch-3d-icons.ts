/**
 * icons:3d — load a free, MIT-licensed 3D icon set and attach it to services
 * and sectors.
 *
 * Source: Microsoft "Fluent Emoji" 3D assets (github.com/microsoft/fluentui-emoji,
 * MIT license — free for commercial use). Every service line and industry sector
 * gets a field-relevant 3D PNG (transparent background) uploaded into the Media
 * library and set as its `customIcon`. The site renders it via <EntityIcon>
 * with the built-in SVG as fallback.
 *
 * Idempotent: documents that already have a customIcon are skipped, and media
 * is reused by alt-text match instead of duplicated. Safe to re-run.
 *
 * Run:   pnpm icons:3d
 * NOTE:  content scripts run outside the web server — rebuild afterwards
 *        (pnpm build && pm2 restart …) so prerendered pages pick the icons up.
 */
import "./load-env";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { getPayload } from "payload";
import config from "../../payload.config";

const BASE = "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets";

type IconMap = Record<string, [string, string]>; // slug → [asset path, media alt]

const SERVICE_ICONS: IconMap = {
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

const SECTOR_ICONS: IconMap = {
  "garments-rmg": ["T-shirt/3D/t-shirt_3d.png", "3D t-shirt icon — garments & RMG sector"],
  government: [
    "Classical building/3D/classical_building_3d.png",
    "3D classical building icon — government & public sector",
  ],
  "ngo-un": ["Handshake/3D/handshake_3d.png", "3D handshake icon — NGO & UN agencies"],
  "industrial-chemical": ["Factory/3D/factory_3d.png", "3D factory icon — industrial & chemical"],
  "ports-logistics": ["Ship/3D/ship_3d.png", "3D ship icon — ports & logistics"],
  healthcare: ["Hospital/3D/hospital_3d.png", "3D hospital icon — healthcare sector"],
  academic: ["Books/3D/books_3d.png", "3D books icon — academic & TVET sector"],
  "food-processing": [
    "Canned food/3D/canned_food_3d.png",
    "3D canned food icon — food processing sector",
  ],
  commercial: [
    "Office building/3D/office_building_3d.png",
    "3D office building icon — commercial & hospitality",
  ],
  heritage: ["Castle/3D/castle_3d.png", "3D fort icon — heritage & cultural sector"],
};

const payload = await getPayload({ config });
const tmp = mkdtempSync(path.join(tmpdir(), "sustech-3d-"));
let attached = 0;
let skipped = 0;

async function attachIcons(collection: "services" | "sectors", icons: IconMap): Promise<void> {
  for (const [slug, [asset, alt]] of Object.entries(icons)) {
    const { docs } = await payload.find({
      collection,
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    });
    const doc = docs[0];
    if (!doc) {
      process.stdout.write(`- ${collection}/${slug}: not found, skipped\n`);
      continue;
    }
    if (doc.customIcon != null) {
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
        process.stdout.write(`- ${collection}/${slug}: download failed (HTTP ${res.status})\n`);
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

    await payload.update({ collection, id: doc.id, data: { customIcon: mediaId } });
    attached += 1;
    process.stdout.write(`✓ ${collection}/${slug} → ${path.basename(asset)}\n`);
  }
}

await attachIcons("services", SERVICE_ICONS);
await attachIcons("sectors", SECTOR_ICONS);

process.stdout.write(`Done. attached: ${attached}, already set (skipped): ${skipped}\n`);
process.exit(0);
