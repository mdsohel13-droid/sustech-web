/**
 * build-3d-static — vendor small static 3D icons into public/icons-3d/.
 *
 * Source: Microsoft Fluent Emoji 3D (github.com/microsoft/fluentui-emoji, MIT).
 * Downloads each asset and resizes to a 128px webp (~10-20 KB) so the files are
 * tiny enough to commit. These power decorative UI icons that are NOT tied to a
 * CMS document (contact details, calculator registry, calculator block chip).
 *
 * Run once when adding icons:   node scripts/build-3d-static.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const BASE = "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets";
const OUT = path.join(__dirname, "..", "public", "icons-3d");

/** output name → Fluent asset path */
const ASSETS = {
  telephone_receiver: "Telephone receiver/3D/telephone_receiver_3d.png",
  envelope: "Envelope/3D/envelope_3d.png",
  round_pushpin: "Round pushpin/3D/round_pushpin_3d.png",
  alarm_clock: "Alarm clock/3D/alarm_clock_3d.png",
  abacus: "Abacus/3D/abacus_3d.png",
  cloud_with_lightning: "Cloud with lightning/3D/cloud_with_lightning_3d.png",
  chart_increasing: "Chart increasing/3D/chart_increasing_3d.png",
  sun: "Sun/3D/sun_3d.png",
  high_voltage: "High voltage/3D/high_voltage_3d.png",
  electric_plug: "Electric plug/3D/electric_plug_3d.png",
};

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const [name, asset] of Object.entries(ASSETS)) {
    const out = path.join(OUT, `${name}.webp`);
    if (fs.existsSync(out)) {
      process.stdout.write(`= ${name}.webp exists, skipped\n`);
      continue;
    }
    const res = await fetch(`${BASE}/${asset.replaceAll(" ", "%20")}`);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${asset}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await sharp(buf).resize(128, 128, { fit: "inside" }).webp({ quality: 82 }).toFile(out);
    const kb = (fs.statSync(out).size / 1024).toFixed(1);
    process.stdout.write(`✓ ${name}.webp (${kb} KB)\n`);
  }
}

main().catch((err) => {
  process.stderr.write(String(err && err.stack ? err.stack : err) + "\n");
  process.exit(1);
});
