import type { ServiceSlug } from "./types";

interface Rule {
  match: RegExp;
  service: ServiceSlug;
}

// Order matters only for which appears first in `services`; all matches are collected.
const RULES: Rule[] = [
  { match: /\bsolar\b|renewable|\bpv\b|rooftop/i, service: "solar-renewable" },
  { match: /\bbess\b|battery|\bess\b|storage|\bups\b/i, service: "bess-storage" },
  {
    match: /substation|transformer|generator|\bht\b|\bhv\b|busbar|\bbbt\b|centrifug/i,
    service: "substation-hv",
  },
  {
    match: /\bmep\b|electrical|panel|switchgear|cable|wiring|distribution|\bepc\b/i,
    service: "electrical-epc",
  },
  { match: /\blps\b|lightning|earthing|earth\s*pit|grounding/i, service: "lps-earthing" },
  { match: /lighting|\bfan\b|\bled\b|street\s*light/i, service: "lighting-distribution" },
  {
    match: /ir\s*&?\s*er|testing|thermal|thermograph|inspection|\bdife\b/i,
    service: "inspection-testing",
  },
  { match: /\bfire\b|alarm|fire\s*safety/i, service: "fire-safety" },
  { match: /training|\bloto\b|oh\s*&?\s*s\b|\bohs\b/i, service: "training-safety" },
  { match: /consultancy|\baudit\b|sreda|compliance/i, service: "consultancy" },
];

/** Map a free-text "Service Lines" cell to canonical service slugs. */
export function mapServiceLines(raw: string | null | undefined): {
  services: ServiceSlug[];
  proposed: string[];
} {
  const text = (raw ?? "").trim();
  if (!text) return { services: [], proposed: [] };
  const services: ServiceSlug[] = [];
  for (const rule of RULES) {
    if (rule.match.test(text) && !services.includes(rule.service)) services.push(rule.service);
  }
  return { services, proposed: [] };
}
