import type { GlobalConfig } from "payload";
import { isAdminOrEditor } from "../access";

/**
 * Tariff rates (Lead Engine master plan §3.0). The cited electricity + diesel
 * prices that calculators use. HUMAN-EDITED ONLY — the nightly source-watcher
 * never writes here; an admin updates the value when a BERC order changes and
 * records the source URL + verification date. Every calculator surfaces a
 * "Rates source: … (as of {date})" line read from this global, so no number on
 * the site is unsourced.
 *
 * NOTE: store the verified figure from the official notification. The catalog
 * marketing ceiling ("up to 75%") NEVER enters this global or any formula.
 */
export const TariffRates: GlobalConfig = {
  slug: "tariff-rates",
  label: "Tariff Rates (calculators)",
  admin: {
    group: "Lead Engine",
    description:
      "Cited electricity & diesel prices used by the calculators. Update from the official " +
      "BERC/utility notification and set the source URL + date. Human-edited only.",
  },
  access: { read: () => true, update: isAdminOrEditor },
  fields: [
    {
      type: "collapsible",
      label: "Electricity — industrial / commercial (BDT per kWh)",
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "industrialFlatBdtPerKwh",
              type: "number",
              required: true,
              defaultValue: 11.5,
              admin: { width: "50%", step: 0.01, description: "Indicative industrial flat rate." },
            },
            {
              name: "commercialFlatBdtPerKwh",
              type: "number",
              required: true,
              defaultValue: 13.0,
              admin: { width: "50%", step: 0.01 },
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "electricitySourceLabel",
              type: "text",
              defaultValue: "BERC retail tariff notification",
              admin: { width: "50%", description: 'e.g. "BERC Order No. … 2026".' },
            },
            { name: "electricitySourceUrl", type: "text", admin: { width: "50%" } },
          ],
        },
        {
          name: "electricityVerifiedAt",
          type: "date",
          admin: { description: 'Surfaced as "rates as of {date}".' },
        },
      ],
    },
    {
      type: "collapsible",
      label: "Diesel generation",
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "dieselPriceBdtPerLitre",
              type: "number",
              required: true,
              defaultValue: 105,
              admin: { width: "33%", step: 0.5 },
            },
            {
              name: "dieselGenEfficiencyKwhPerLitre",
              type: "number",
              required: true,
              defaultValue: 3.2,
              admin: {
                width: "33%",
                step: 0.1,
                description: "kWh produced per litre (typical 3.0–3.6).",
              },
            },
            {
              name: "dieselMaintenanceBdtPerKwh",
              type: "number",
              required: true,
              defaultValue: 1.5,
              admin: { width: "33%", step: 0.1, description: "Servicing/oil per kWh." },
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "dieselSourceLabel",
              type: "text",
              defaultValue: "BPC retail diesel price",
              admin: { width: "50%" },
            },
            { name: "dieselSourceUrl", type: "text", admin: { width: "50%" } },
          ],
        },
        { name: "dieselVerifiedAt", type: "date" },
      ],
    },
    {
      type: "collapsible",
      label: "Solar & BESS reference (for estimates)",
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "bessRoundTripEfficiency",
              type: "number",
              required: true,
              defaultValue: 0.92,
              admin: {
                width: "50%",
                step: 0.01,
                description:
                  "Conservative LFP round-trip (0.90–0.95). Used as a floor, not the catalog ceiling.",
              },
            },
            {
              name: "solarYieldKwhPerKwpDay",
              type: "number",
              required: true,
              defaultValue: 4.2,
              admin: {
                width: "50%",
                step: 0.1,
                description: "Bangladesh avg daily yield per kWp (Global Solar Atlas).",
              },
            },
          ],
        },
      ],
    },
  ],
};
