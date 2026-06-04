import "./load-env";
import { readFileSync, writeFileSync } from "node:fs";
import { getPayload } from "payload";
import config from "../../payload.config";
import type { Project } from "../../payload-types";

// ── Sector inference ──────────────────────────────────────────────
// Uses the client name (from the gitignored crosswalk) and the source
// service lines. NEVER guesses when evidence is thin — returns
// { sector: null } or confirmed:false so a human assigns/verifies it.

type SectorSlug =
  | "manufacturing-rmg-textile"
  | "power-utilities"
  | "commercial-real-estate"
  | "ports-heavy-industry";

interface SectorOverride {
  match: string; // case-insensitive regex against the client name
  sector: SectorSlug;
  confirmed?: boolean;
}

// Named-client → sector overrides are loaded from a GITIGNORED data file so no
// client names live in (public) source. Source keeps generic industry keywords only.
function loadOverrides(): SectorOverride[] {
  try {
    const raw = readFileSync("data/sector-overrides.json", "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (o): o is SectorOverride =>
        typeof o === "object" &&
        o !== null &&
        typeof (o as SectorOverride).match === "string" &&
        typeof (o as SectorOverride).sector === "string",
    );
  } catch {
    return [];
  }
}

function inferSector(
  clientName: string,
  serviceLines: string,
  overrides: SectorOverride[],
): { sector: SectorSlug | null; confirmed: boolean } {
  const n = clientName.toLowerCase();
  const s = serviceLines.toLowerCase();

  // ── Generic industry keywords (no client names) ──────────────────
  if (/port|container|logistics?|crane|heavy\s*industr|shipping|cargo|harbour/i.test(n)) {
    return { sector: "ports-heavy-industry", confirmed: true };
  }
  if (
    /apparel|garment|textile|mill|fashion|shoe|jeans|accessor(y|ies)|mfg|manufactur|factory|plant/i.test(
      n,
    )
  ) {
    return { sector: "manufacturing-rmg-textile", confirmed: true };
  }
  if (/solar|renewable|energy|power|utility|substation|pv/i.test(n)) {
    return { sector: "power-utilities", confirmed: true };
  }
  if (
    /residential|commercial|real\s*estate|property|building|mall|office|condo|apartment|pwd|public\s*works|cemetery/i.test(
      n,
    )
  ) {
    return { sector: "commercial-real-estate", confirmed: true };
  }

  // ── Named-client overrides (from gitignored data, lower confidence) ─
  for (const o of overrides) {
    if (new RegExp(o.match, "i").test(n)) {
      return { sector: o.sector, confirmed: o.confirmed ?? false };
    }
  }

  // ── Inference from source service lines (no client name) ─────────
  if (/substation|transformer|generator|solar|renewable/i.test(s) && !/lighting|fan/i.test(s)) {
    return { sector: "power-utilities", confirmed: false };
  }

  return { sector: null, confirmed: false };
}

// ── Main ─────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const payload = await getPayload({ config });

  // Client names live only in the gitignored crosswalk — never in the CMS.
  const crosswalk = new Map<string, string>();
  try {
    const csv = readFileSync("data/import-crosswalk.csv", "utf8");
    for (const line of csv.trim().split("\n").slice(1)) {
      const idx = line.indexOf(",");
      if (idx < 0) continue;
      const key = line.slice(0, idx);
      const rest = line.slice(idx + 1);
      const q2 = rest.lastIndexOf('"');
      const beforeLastQuote = rest.slice(0, q2);
      const lastComma = beforeLastQuote.lastIndexOf(",");
      if (q2 < 0 || lastComma < 0) continue;
      crosswalk.set(key, rest.slice(lastComma + 2, q2));
    }
  } catch {
    payload.logger.warn("Crosswalk not found — sector inference will rely on service lines only.");
  }

  const overrides = loadOverrides();
  if (overrides.length === 0) {
    payload.logger.warn("No sector overrides file — using generic keywords + service lines only.");
  }

  const sectors = await payload.find({ collection: "sectors", limit: 50, depth: 0 });
  const sectorSlugToId = new Map<string, number>(sectors.docs.map((d) => [d.slug, d.id]));

  const projects = await payload.find({
    collection: "projects",
    limit: 500,
    draft: true,
    overrideAccess: true,
    depth: 0,
  });
  payload.logger.info(`Enriching ${projects.docs.length} draft projects…`);

  let assigned = 0;
  let needsConfirm = 0;
  let cleared = 0;

  for (const project of projects.docs) {
    const notes = project.importNotes ?? "";
    const svcMatch = notes.match(/Service lines \(source\): (.+?)(?:\n|$)/);
    const rawServiceLines = svcMatch ? svcMatch[1].trim() : "";
    const clientName = crosswalk.get(project.importKey ?? "") ?? "";

    const { sector: sectorSlug, confirmed } = inferSector(clientName, rawServiceLines, overrides);

    const updateData: Partial<Project> = {};

    // 1. Sector — set the relationship by resolved id; flag for review when unsure.
    const sectorId = sectorSlug ? sectorSlugToId.get(sectorSlug) : undefined;
    if (sectorId !== undefined) {
      updateData.sector = sectorId;
      updateData.needsSectorReview = !confirmed;
      if (confirmed) assigned++;
      else needsConfirm++;
      const label = sectorSlug?.replace(/-/g, " ") ?? "unknown";
      updateData.importNotes = notes.replace(
        "Sector: TODO — assign before publishing.",
        `Sector: ${label}${confirmed ? "" : " (needs confirmation)"}.`,
      );
    } else {
      updateData.needsSectorReview = true;
      needsConfirm++;
    }

    // 2. Summary — short, factual (services + year only). Invent nothing.
    updateData.summary = `Sustech delivered ${rawServiceLines || "engineering works"}${
      project.year ? ` in ${project.year}` : ""
    }.`;

    // 3. Narrative — left BLANK for human/Hermes authoring. Clear any prior
    //    auto-generated content so no unverified claims sit in the drafts.
    if (project.challenge || project.solution || project.outcome) cleared++;
    updateData.challenge = null;
    updateData.solution = null;
    updateData.outcome = null;

    try {
      await payload.update({
        collection: "projects",
        id: project.id,
        data: updateData,
        draft: true,
        overrideAccess: true,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      payload.logger.error(`Failed to enrich project #${project.id} (${project.name}): ${message}`);
    }
  }

  payload.logger.info(
    `Enrichment complete: ${assigned} sector(s) assigned, ${needsConfirm} flagged for review, ${cleared} narrative(s) cleared.`,
  );

  const report = [
    "# Project Enrichment Report",
    "> Regenerate with `pnpm enrich:projects`.",
    "",
    "## Summary",
    "| Metric | Count |",
    "|---|---|",
    `| Drafts processed | ${projects.docs.length} |`,
    `| Sector assigned (confident) | ${assigned} |`,
    `| Sector flagged for review | ${needsConfirm} |`,
    `| Auto-narratives cleared | ${cleared} |`,
    "",
    "Sectors are inferred from the gitignored crosswalk + source service lines.",
    "`summary` is a short factual line (services + year). `challenge`/`solution`/`outcome`",
    "are left blank for human/Hermes authoring — no claims are invented. All projects",
    "remain **drafts** pending human review and publish approval.",
  ].join("\n");
  writeFileSync("data/enrich-report.md", report, "utf8");
}

main()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
