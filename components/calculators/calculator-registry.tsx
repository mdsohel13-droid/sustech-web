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
import type { TariffSnapshot } from "@/lib/tariffs";
import { AtmUpsSizingCalculator } from "./atm-ups-sizing-calculator";
import { CableSizingCalculator } from "./cable-sizing-calculator";
import { DieselVsBessCalculator } from "./diesel-vs-bess-calculator";
import { EarthingResistanceCalculator } from "./earthing-resistance-calculator";
import { OutageCostCalculator } from "./outage-cost-calculator";
import { LightningZoneCalculator } from "./lightning-zone-calculator";
import { SolarRoiCalculator } from "./solar-roi-calculator";
import { SolarYieldCalculator } from "./solar-yield-calculator";

/** Props every calculator may receive. Rate-driven ones use `rates`; others ignore it. */
export interface CalculatorProps {
  rates?: TariffSnapshot;
}

export interface CalcMeta {
  title: string;
  description: string;
  icon: string; // emoji fallback (text contexts)
  iconSrc: string; // static 3D icon (public/icons-3d, MIT Fluent set)
  category: string;
  component: ComponentType<CalculatorProps>;
  standards?: string[]; // relevant codes
}

export const CALCULATOR_REGISTRY: Record<CalcType, CalcMeta> = {
  "solar-roi": {
    title: "Solar ROI / Payback Period",
    description:
      "Estimate the financial return on a commercial or industrial solar installation. " +
      "Uses Bangladesh BPDB tariffs and local irradiance data.",
    icon: "☀️",
    iconSrc: "/icons-3d/sun.webp",
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
    iconSrc: "/icons-3d/high_voltage.webp",
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
    iconSrc: "/icons-3d/electric_plug.webp",
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
    iconSrc: "/icons-3d/cloud_with_lightning.webp",
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
    iconSrc: "/icons-3d/chart_increasing.webp",
    category: "Solar & Energy",
    component: SolarYieldCalculator,
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
    component: DieselVsBessCalculator,
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
    component: AtmUpsSizingCalculator,
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
    component: OutageCostCalculator,
    standards: ["BERC tariff", "BPC diesel price"],
  },
};

/** Look up a calculator entry, returns undefined for unknown types. */
export function getCalcMeta(type: string): CalcMeta | undefined {
  return CALCULATOR_REGISTRY[type as CalcType];
}
