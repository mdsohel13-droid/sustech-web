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
import { CALCULATOR_META, type CalcMetaBase } from "./calculator-meta";
import { AtmUpsSizingCalculator } from "./atm-ups-sizing-calculator";
import { CableSizingCalculator } from "./cable-sizing-calculator";
import { DieselVsBessCalculator } from "./diesel-vs-bess-calculator";
import { EarthingResistanceCalculator } from "./earthing-resistance-calculator";
import { OutageCostCalculator } from "./outage-cost-calculator";
import { LightningZoneCalculator } from "./lightning-zone-calculator";
import { SolarRoiCalculator } from "./solar-roi-calculator";
import { SolarYieldCalculator } from "./solar-yield-calculator";
import { SolarfinProCalculator } from "./solarfin-pro-calculator";
import { ExternalReferenceCalculator } from "./external-reference-calculator";

/** Props every calculator may receive. Rate-driven ones use `rates`; others ignore it. */
export interface CalculatorProps {
  rates?: TariffSnapshot;
}

/** Metadata (from calculator-meta — the source of truth) plus the React component. */
export interface CalcMeta extends CalcMetaBase {
  component: ComponentType<CalculatorProps>;
}

/** calcType → React component. Titles/descriptions/icons live in calculator-meta.ts. */
const CALCULATOR_COMPONENTS: Record<CalcType, ComponentType<CalculatorProps>> = {
  "solar-roi": SolarRoiCalculator,
  "earthing-resistance": EarthingResistanceCalculator,
  "cable-sizing": CableSizingCalculator,
  "lightning-zone": LightningZoneCalculator,
  "solar-yield": SolarYieldCalculator,
  "diesel-vs-bess": DieselVsBessCalculator,
  "atm-ups-sizing": AtmUpsSizingCalculator,
  "outage-cost": OutageCostCalculator,
  "solarfin-pro": SolarfinProCalculator,
  "external-reference": ExternalReferenceCalculator,
};

export const CALCULATOR_REGISTRY: Record<CalcType, CalcMeta> = Object.fromEntries(
  (Object.entries(CALCULATOR_META) as [CalcType, CalcMetaBase][]).map(([type, meta]) => [
    type,
    { ...meta, component: CALCULATOR_COMPONENTS[type] },
  ]),
) as Record<CalcType, CalcMeta>;

/** Look up a calculator entry, returns undefined for unknown types. */
export function getCalcMeta(type: string): CalcMeta | undefined {
  return CALCULATOR_REGISTRY[type as CalcType];
}
