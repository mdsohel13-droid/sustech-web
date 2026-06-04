import { NEW_SERVICE_LABEL, type ServiceSlug } from "./types";

interface Rule {
  match: RegExp;
  service: ServiceSlug | "NEW";
}

// Order matters only for which appears first in `services`; all matches are collected.
const RULES: Rule[] = [
  { match: /\bsolar\b|renewable|\bpv\b/i, service: "solar-energy" },
  {
    match:
      /\bmep\b|electrical|generator|transformer|substation|panel|switchgear|cable|busbar|\bbbt\b/i,
    service: "electrical-epc",
  },
  {
    match: /\blps\b|lightning|earthing|earth\s*pit|grounding/i,
    service: "grounding-lightning-protection",
  },
  { match: /lighting|\bfan\b/i, service: "smart-systems" },
  {
    match: /ir\s*&?\s*er|testing|thermal|thermograph|inspection|audit|consultancy|fire|safety/i,
    service: "NEW",
  },
];

/** Map a free-text "Service Lines" cell to canonical service slugs + proposed new categories. */
export function mapServiceLines(raw: string | null | undefined): {
  services: ServiceSlug[];
  proposed: string[];
} {
  const text = (raw ?? "").trim();
  if (!text) return { services: [], proposed: [] };
  const services: ServiceSlug[] = [];
  const proposed: string[] = [];
  for (const rule of RULES) {
    if (!rule.match.test(text)) continue;
    if (rule.service === "NEW") {
      if (!proposed.includes(NEW_SERVICE_LABEL)) proposed.push(NEW_SERVICE_LABEL);
    } else if (!services.includes(rule.service)) {
      services.push(rule.service);
    }
  }
  return { services, proposed };
}
