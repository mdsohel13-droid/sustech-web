/**
 * Calculator metadata — the single source of truth for which calculators exist
 * and how they're described. Pure data (no React imports), so it is safe to
 * import from server code, the CMS, AND node seed scripts (cms/scripts/*).
 *
 * - calculator-registry.tsx pairs each entry with its React component.
 * - cms/scripts/seed-calculators.ts upserts one knowledge-resource per entry so
 *   EVERY calculator shows up in the /knowledge "Calculators" tab + sitemap
 *   (the hub lists from the CMS, not the code registry).
 *
 * To add a calculator: add an entry here (+ CALC_TYPES in knowledge-resources.ts),
 * wire its component in calculator-registry.tsx, then run `pnpm seed:calculators`.
 */
import type { CalcType } from "../../cms/collections/knowledge-resources";

export interface CalcMetaBase {
  title: string;
  description: string;
  icon: string; // emoji fallback (text contexts)
  iconSrc: string; // static 3D icon (public/icons-3d, MIT Fluent set)
  category: string;
  standards?: string[]; // relevant codes
}

export const CALCULATOR_META: Record<CalcType, CalcMetaBase> = {
  "solar-roi": {
    title: "Solar ROI / Payback Period",
    description:
      "Estimate the financial return on a commercial or industrial solar installation. " +
      "Uses Bangladesh BPDB tariffs and local irradiance data.",
    icon: "☀️",
    iconSrc: "/icons-3d/sun.webp",
    category: "Solar & Energy",
    standards: ["IEC 62548", "SREDA net metering"],
  },
  "earthing-resistance": {
    title: "Earthing Resistance",
    description:
      "Calculate the ground resistance of a single vertical rod using Dwight's formula. " +
      "Includes IEC 60364 / IEC 62305 compliance check.",
    icon: "⚡",
    iconSrc: "/icons-3d/high_voltage.webp",
    category: "Grounding & Lightning",
    standards: ["IEC 60364-5-54", "IEC 62305", "BNBC"],
  },
  "cable-sizing": {
    title: "Cable Sizing — Voltage Drop",
    description:
      "Find the minimum cable cross-section to meet voltage drop limits " +
      "for copper and aluminium conductors per IEC 60228.",
    icon: "🔌",
    iconSrc: "/icons-3d/electric_plug.webp",
    category: "Electrical EPC",
    standards: ["IEC 60228", "IEC 60364-5-52"],
  },
  "lightning-zone": {
    title: "Lightning Protection Zone",
    description:
      "Determine the protection radius of an air termination using the IEC 62305 " +
      "Rolling Sphere Method. Includes LPL selection guide.",
    icon: "🌩️",
    iconSrc: "/icons-3d/cloud_with_lightning.webp",
    category: "Grounding & Lightning",
    standards: ["IEC 62305-3", "IEC 62305-2"],
  },
  "solar-yield": {
    title: "Solar Energy Yield",
    description:
      "Estimate annual electricity generation for any city in Bangladesh using " +
      "NASA POWER irradiance data and IEC performance ratio standards.",
    icon: "📊",
    iconSrc: "/icons-3d/chart_increasing.webp",
    category: "Solar & Energy",
    standards: ["IEC 61724", "IEC 61853"],
  },
  "diesel-vs-bess": {
    title: "Diesel vs Lithium BESS",
    description:
      "Compare the monthly running cost of a diesel generator versus a grid/solar-charged " +
      "LFP battery for backup, using cited Bangladesh tariffs. Emails a sourced report.",
    icon: "🔋",
    iconSrc: "/icons-3d/chart_increasing.webp",
    category: "Solar & Energy",
    standards: ["BERC tariff", "BPC diesel price"],
  },
  "atm-ups-sizing": {
    title: "ATM / branch UPS sizing",
    description:
      "Size an online UPS and battery bank to keep ATMs or a bank branch running " +
      "through an outage. For banks & financial institutions.",
    icon: "🏧",
    iconSrc: "/icons-3d/electric_plug.webp",
    category: "Electrical EPC",
    standards: ["IEC 62040 (UPS)"],
  },
  "outage-cost": {
    title: "Cost of power outages",
    description:
      "Estimate what unplanned load-shedding costs your operation each month — lost " +
      "revenue plus idle staff — and the diesel cost of covering it.",
    icon: "⏱️",
    iconSrc: "/icons-3d/high_voltage.webp",
    category: "Solar & Energy",
    standards: ["BERC tariff", "BPC diesel price"],
  },
  "solarfin-pro": {
    title: "SolarFin Pro — Bankable Tariff & LCOE",
    description:
      "Calculate the Levelized Cost of Energy (LCOE) and minimum bankable solar tariff " +
      "for commercial and industrial projects in Bangladesh. Includes debt financing, NPV, " +
      "IRR, and DSCR analysis with Bangladesh-specific cost parameters.",
    icon: "💹",
    iconSrc: "/icons-3d/chart_increasing.webp",
    category: "Solar & Energy",
    standards: ["NREL LCOE model", "SREDA net metering", "BPDB tariff"],
  },
  "external-reference": {
    title: "BAESS — Free Solar Engineering Tools (External Reference)",
    description:
      "A curated reference of free external tools, databases, and standards for solar " +
      "engineering and compliance in Bangladesh — PVGIS, NASA POWER, SAM, RETScreen, and more.",
    icon: "🔗",
    iconSrc: "/icons-3d/electric_plug.webp",
    category: "Reference",
    standards: [],
  },
};

/** Stable display order for the Knowledge Hub (lower = first). */
export const CALC_ORDER: CalcType[] = [
  "diesel-vs-bess",
  "solar-roi",
  "solarfin-pro",
  "solar-yield",
  "outage-cost",
  "atm-ups-sizing",
  "earthing-resistance",
  "lightning-zone",
  "cable-sizing",
  "external-reference",
];
