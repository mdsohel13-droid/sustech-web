/**
 * Company facts — the single source for Sustech's headline stats (master plan
 * §3.1d rule 2). Content NEVER hard-codes "103+ projects / 175+ clients / 10
 * sectors / 8 years" in body copy (content-lint flags literals); instead pages
 * interpolate from here, which reads the CMS `siteSettings.proof.stats` array
 * so a non-technical admin updates the numbers in one place.
 *
 * The catalog performance figures live here too — always pre-hedged so they
 * can never be rendered as guarantees or prices.
 *
 * @see SiteSetting.stats (the CMS "Headline statistics" array)
 */
import { getSiteSettings } from "@/lib/payload";

export interface CompanyStat {
  key: string; // normalized slug: "projects" | "clients" | "sectors" | "years"
  value: number;
  suffix: string; // "+", "%", "MWp"
  label: string;
  display: string; // e.g. "103+"
}

/** Normalize a stat label to a stable key for interpolation lookups. */
function statKey(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("project")) return "projects";
  if (l.includes("client")) return "clients";
  if (l.includes("sector")) return "sectors";
  if (l.includes("year")) return "years";
  return l.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** Read the CMS stats and return them keyed for interpolation (cached by ISR). */
export async function getCompanyStats(): Promise<Record<string, CompanyStat>> {
  const settings = await getSiteSettings();
  const stats = settings.stats ?? [];
  const out: Record<string, CompanyStat> = {};
  for (const s of stats) {
    if (typeof s.value !== "number" || !s.label) continue;
    const key = statKey(s.label);
    out[key] = {
      key,
      value: s.value,
      suffix: s.suffix ?? "",
      label: s.label,
      display: `${s.value}${s.suffix ?? ""}`,
    };
  }
  return out;
}

/**
 * Replace {{stat:key}} tokens in a string with the live CMS value.
 * Unknown keys are left as-is (visible, so a typo is caught in review).
 * e.g. "Across {{stat:projects}} projects" → "Across 103+ projects".
 */
export function interpolateStats(text: string, stats: Record<string, CompanyStat>): string {
  return text.replace(/\{\{stat:([a-z0-9-]+)\}\}/gi, (whole, key: string) => {
    const stat = stats[key.toLowerCase()];
    return stat ? stat.display : whole;
  });
}

/**
 * Catalog performance figures — pre-hedged constants (master plan §3.1d rule 2).
 * Use these instead of typing the numbers, so the hedge travels with the value.
 */
export const CATALOG_FIGURES = {
  bessSavingsVsDiesel: "up to 75%",
  roundTripEfficiency: "95%+",
  bessResponseTime: "<20 ms",
  heroEeCapacity: "1004.8 Wh",
  heroEeOutput: "500 W pure sine",
} as const;
