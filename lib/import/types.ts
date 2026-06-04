/**
 * Canonical project schema for the importer — the web-safe shape that maps onto the CMS
 * Projects collection. Financials, contacts, addresses, win rates, pipeline notes and file
 * paths NEVER appear here. Narratives (summary/challenge/solution/outcome) are written later
 * by Hermes, not by this pipeline.
 */

export const CANONICAL_SERVICES = {
  "solar-energy": "Solar & Energy",
  "electrical-epc": "Electrical EPC",
  "grounding-lightning-protection": "Grounding & Lightning Protection",
  "smart-systems": "Smart Systems",
} as const;

export type ServiceSlug = keyof typeof CANONICAL_SERVICES;

/** A category present in the data but not yet a real Service — flagged for the MD. */
export const NEW_SERVICE_LABEL = "Testing, Inspection & Consultancy";

export interface CanonicalProject {
  /** Opaque, stable de-dup key derived from client identity. Not reversible on the site. */
  importKey: string;
  /** Anonymized, web-safe label (no client identity). */
  title: string;
  /** REAL client name — used only for de-dup + the gitignored crosswalk; never written to the CMS. */
  clientName: string;
  /** Default false: client stays anonymous until the MD approves naming. */
  clientPublic: boolean;
  /** Always "TODO" from this source — sector is not in the data and is never guessed. */
  sector: "TODO";
  /** Matched existing services. */
  services: ServiceSlug[];
  /** Categories not yet modelled as a Service (e.g. Testing, Inspection & Consultancy). */
  proposedServices: string[];
  year?: number;
  /** Non-financial scale note. Usually empty from this source. */
  scaleNote?: string;
  /** Non-identifying industry category hint, to help assign the sector on review. */
  category?: string;
  /** Raw service-line text (web-safe descriptors) for the admin import note. */
  rawServiceLines?: string;
  source: "excel" | "erp";
}

export interface SkippedRow {
  /** Aggregated in the report; never carries client identity. */
  reason: string;
}

export interface SourceResult {
  records: CanonicalProject[];
  skipped: SkippedRow[];
  rowsRead: number;
}

/** One interface, swappable implementations (excel now, erp later). */
export interface ProjectSource {
  readonly id: "excel" | "erp";
  load(): Promise<SourceResult>;
}
