import type { Field } from "payload";

/**
 * Reusable citation + claim fields (Lead Engine master plan §3.0). Added to
 * `articles` and `news-items` so every published number traces to a registered
 * source, renders a "Sources & References" section, and emits Schema.org
 * `citation` markup (citable by AI engines).
 *
 *  - `citations[]` — the bibliography: each entry links a `sources` doc to the
 *    exact claim it backs, with a deep URL + accessed date. In body copy,
 *    `[cite:n]` (1-based) references the nth entry; the renderer turns it into
 *    a superscript footnote link.
 *  - `claims[]` — the numeric ledger (captured from day one so the Phase-4
 *    claim-diff guard has data). References citations by index; company-catalog
 *    figures need no external citation.
 */

/** Article/news categories. The citation-required set is enforced by a hook. */
export const CONTENT_CATEGORIES = [
  { label: "Knowledge explainer", value: "knowledge-explainer" },
  { label: "Market data", value: "market-data" },
  { label: "Tariffs", value: "tariffs" },
  { label: "Policy", value: "policy" },
  { label: "Finance", value: "finance" },
  { label: "Calculations", value: "calculations" },
  { label: "Industry news roundup", value: "industry-news-roundup" },
  { label: "Glossary", value: "glossary" },
  { label: "Company update", value: "company-update" },
] as const;

/** Categories where any published number MUST carry a citation (§3.1d rule 1). */
export const CITATION_REQUIRED_CATEGORIES: ReadonlySet<string> = new Set([
  "market-data",
  "tariffs",
  "policy",
  "finance",
  "calculations",
]);

/** Category select field, shared by articles + news-items. */
export const categoryField: Field = {
  name: "category",
  type: "select",
  required: true,
  defaultValue: "knowledge-explainer",
  options: [...CONTENT_CATEGORIES],
  admin: {
    position: "sidebar",
    description:
      "Drives citation enforcement (market-data / tariffs / policy / finance / calculations require ≥1 citation) and the nightly auto-update whitelist.",
  },
};

export const citationsField: Field = {
  name: "citations",
  type: "array",
  labels: { singular: "Citation", plural: "Citations" },
  admin: {
    description:
      "Bibliography. Reference the nth entry in body copy with [cite:n]. Required for market-data / tariffs / policy / finance / calculations.",
  },
  fields: [
    {
      name: "source",
      type: "relationship",
      relationTo: "sources",
      required: true,
      index: true, // nightly backlink query: where[citations.source][equals]
    },
    {
      name: "quotedClaim",
      type: "textarea",
      required: true,
      admin: { description: "The exact claim in THIS document the source backs." },
    },
    {
      name: "url",
      type: "text",
      required: true,
      admin: { description: "Deep link to the specific page/document." },
    },
    { name: "title", type: "text" },
    { name: "accessedDate", type: "date", required: true },
    { name: "sourcePublishedDate", type: "date" },
    {
      name: "locator",
      type: "text",
      admin: { description: 'e.g. "p. 14", "SRO No. 155", "Circular No. 02/2024".' },
    },
    {
      name: "lastVerifiedAt",
      type: "date",
      admin: { description: "Refreshed by approved revisions." },
    },
  ],
};

export const claimsField: Field = {
  name: "claims",
  type: "array",
  labels: { singular: "Claim", plural: "Claims (numeric ledger)" },
  admin: {
    initCollapsed: true,
    description:
      "Numbers stated in this document and where each comes from. Powers the claim-diff guard before auto-publish.",
  },
  fields: [
    { name: "claimText", type: "text" },
    {
      type: "row",
      fields: [
        { name: "value", type: "text", admin: { width: "50%" } },
        { name: "unit", type: "text", admin: { width: "50%" } },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "sourceType",
          type: "select",
          defaultValue: "registry-source",
          options: [
            { label: "Registry source", value: "registry-source" },
            { label: "Company catalog", value: "company-catalog" },
          ],
          admin: { width: "50%" },
        },
        {
          name: "citationIndex",
          type: "number",
          min: 1,
          admin: {
            width: "50%",
            description:
              "1-based index into citations[]. Empty only when sourceType = company-catalog.",
          },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "hedge",
          type: "select",
          defaultValue: "as-of-date",
          options: [
            { label: "As of date", value: "as-of-date" },
            { label: "Up to", value: "up-to" },
            { label: "Approximate", value: "approx" },
            { label: "Exact / verified", value: "exact-verified" },
          ],
          admin: { width: "50%" },
        },
        { name: "retrievedAt", type: "date", admin: { width: "50%" } },
      ],
    },
  ],
};
