/**
 * Calculator registry — maps calcType CMS values to React components.
 *
 * This is the single place to add or remove built-in calculators.
 * The CMS `knowledge-resources` collection uses the same keys (CalcType).
 *
 * To add a new calculator:
 *   1. Build the component in ./components/calculators/
 *   2. Add an entry here
 *   3. Add the value to CALC_TYPES in cms/collections/knowledge-resources.ts
 *   4. Run pnpm generate:types
 *   5. Admins can create a Knowledge Resource with the new calcType
 */

import type { ComponentType } from "react";
import type { CalcType } from "@/cms/collections/knowledge-resources";
import { CableSizingCalculator } from "./cable-sizing-calculator";
import { EarthingResistanceCalculator } from "./earthing-resistance-calculator";
import { LightningZoneCalculator } from "./lightning-zone-calculator";
import { SolarRoiCalculator } from "./solar-roi-calculator";
import { SolarYieldCalculator } from "./solar-yield-calculator";

export interface CalcMeta {
  title: string;
  description: string;
  icon: string; // emoji or short SVG symbol
  category: string;
  component: ComponentType;
  standards?: string[]; // relevant codes
}

export const CALCULATOR_REGISTRY: Record<CalcType, CalcMeta> = {
  "solar-roi": {
    title: "Solar ROI / Payback Period",
    description:
      "Estimate the financial return on a commercial or industrial solar installation. " +
      "Uses Bangladesh BPDB tariffs and local irradiance data.",
    icon: "☀️",
    category: "Solar & Energy",
    component: SolarRoiCalculator,
    standards: ["IEC 62548", "SREDA net metering"],
  },
  "earthing-resistance": {
    title: "Earthing Resistance",
    description:
      "Calculate the ground resistance of a single vertical rod using Dwight's formula. " +
      "Includes IEC 60364 / IEC 62305 compliance check.",
    icon: "⚡",
    category: "Grounding & Lightning",
    component: EarthingResistanceCalculator,
    standards: ["IEC 60364-5-54", "IEC 62305", "BNBC"],
  },
  "cable-sizing": {
    title: "Cable Sizing — Voltage Drop",
    description:
      "Find the minimum cable cross-section to meet voltage drop limits " +
      "for copper and aluminium conductors per IEC 60228.",
    icon: "🔌",
    category: "Electrical EPC",
    component: CableSizingCalculator,
    standards: ["IEC 60228", "IEC 60364-5-52"],
  },
  "lightning-zone": {
    title: "Lightning Protection Zone",
    description:
      "Determine the protection radius of an air termination using the IEC 62305 " +
      "Rolling Sphere Method. Includes LPL selection guide.",
    icon: "🌩️",
    category: "Grounding & Lightning",
    component: LightningZoneCalculator,
    standards: ["IEC 62305-3", "IEC 62305-2"],
  },
  "solar-yield": {
    title: "Solar Energy Yield",
    description:
      "Estimate annual electricity generation for any city in Bangladesh using " +
      "NASA POWER irradiance data and IEC performance ratio standards.",
    icon: "📊",
    category: "Solar & Energy",
    component: SolarYieldCalculator,
    standards: ["IEC 61724", "IEC 61853"],
  },
};

/** Look up a calculator entry, returns undefined for unknown types. */
export function getCalcMeta(type: string): CalcMeta | undefined {
  return CALCULATOR_REGISTRY[type as CalcType];
}
