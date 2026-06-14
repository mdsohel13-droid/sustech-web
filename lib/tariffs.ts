/**
 * Tariff snapshot + calculator math (Lead Engine master plan §3.3).
 *
 * PURE — no I/O, unit-tested. Server code reads the `tariff-rates` global and
 * passes a TariffSnapshot to the (client) calculators; a built-in default keeps
 * calculators working before an admin sets the global.
 *
 * HARD RULES enforced here:
 *  - formulas use ONLY user inputs + these cited rates; the catalog marketing
 *    ceiling ("up to 75%") never appears in a formula.
 *  - cost outputs are RANGES, not single points, and are labelled indicative
 *    by the caller. We apply a ±band to reflect real-world variance.
 */
import type { TariffRate } from "@/payload-types";

export interface TariffSnapshot {
  industrialBdtPerKwh: number;
  commercialBdtPerKwh: number;
  dieselPriceBdtPerLitre: number;
  dieselKwhPerLitre: number;
  dieselMaintenanceBdtPerKwh: number;
  bessRoundTrip: number;
  solarYieldKwhPerKwpDay: number;
  electricitySourceLabel: string;
  electricitySourceUrl?: string;
  electricityVerifiedAt?: string;
  dieselSourceLabel: string;
  dieselSourceUrl?: string;
  dieselVerifiedAt?: string;
}

/** Conservative built-in defaults (used until the CMS global is set). */
export const DEFAULT_TARIFFS: TariffSnapshot = {
  industrialBdtPerKwh: 11.5,
  commercialBdtPerKwh: 13.0,
  dieselPriceBdtPerLitre: 105,
  dieselKwhPerLitre: 3.2,
  dieselMaintenanceBdtPerKwh: 1.5,
  bessRoundTrip: 0.92,
  solarYieldKwhPerKwpDay: 4.2,
  electricitySourceLabel: "BERC retail tariff notification",
  dieselSourceLabel: "BPC retail diesel price",
};

/** Map the CMS global to a snapshot, falling back to defaults per field. */
export function toTariffSnapshot(g: TariffRate | null | undefined): TariffSnapshot {
  if (!g) return DEFAULT_TARIFFS;
  const d = DEFAULT_TARIFFS;
  return {
    industrialBdtPerKwh: g.industrialFlatBdtPerKwh ?? d.industrialBdtPerKwh,
    commercialBdtPerKwh: g.commercialFlatBdtPerKwh ?? d.commercialBdtPerKwh,
    dieselPriceBdtPerLitre: g.dieselPriceBdtPerLitre ?? d.dieselPriceBdtPerLitre,
    dieselKwhPerLitre: g.dieselGenEfficiencyKwhPerLitre ?? d.dieselKwhPerLitre,
    dieselMaintenanceBdtPerKwh: g.dieselMaintenanceBdtPerKwh ?? d.dieselMaintenanceBdtPerKwh,
    bessRoundTrip: g.bessRoundTripEfficiency ?? d.bessRoundTrip,
    solarYieldKwhPerKwpDay: g.solarYieldKwhPerKwpDay ?? d.solarYieldKwhPerKwpDay,
    electricitySourceLabel: g.electricitySourceLabel ?? d.electricitySourceLabel,
    electricitySourceUrl: g.electricitySourceUrl ?? undefined,
    electricityVerifiedAt: g.electricityVerifiedAt ?? undefined,
    dieselSourceLabel: g.dieselSourceLabel ?? d.dieselSourceLabel,
    dieselSourceUrl: g.dieselSourceUrl ?? undefined,
    dieselVerifiedAt: g.dieselVerifiedAt ?? undefined,
  };
}

export interface DieselVsBessInput {
  loadKw: number; // average backed-up load
  outageHoursPerDay: number;
  daysPerMonth: number;
  /** "industrial" | "commercial" — which grid rate charges the battery. */
  rateClass: "industrial" | "commercial";
}

export interface MoneyRange {
  low: number;
  high: number;
}

export interface DieselVsBessResult {
  monthlyKwh: number;
  dieselCostPerKwh: number;
  bessCostPerKwh: number;
  dieselMonthly: MoneyRange;
  bessMonthly: MoneyRange;
  monthlySavings: MoneyRange;
  annualSavings: MoneyRange;
  savingsPercent: MoneyRange; // 0–100
}

const VARIANCE = 0.1; // ±10% band → results are ranges, never single points
const round = (n: number): number => Math.round(n);
const band = (mid: number): MoneyRange => ({
  low: round(mid * (1 - VARIANCE)),
  high: round(mid * (1 + VARIANCE)),
});

/**
 * Diesel-generator vs grid-charged LFP-BESS running cost for backup energy.
 * Returns ranges. Compares *energy cost* only (fuel+maintenance vs grid+losses)
 * — capex is intentionally out of scope and stated as such in the UI.
 */
export function dieselVsBess(input: DieselVsBessInput, r: TariffSnapshot): DieselVsBessResult {
  const loadKw = Math.max(0, input.loadKw);
  const hours = Math.max(0, input.outageHoursPerDay);
  const days = Math.max(0, Math.min(31, input.daysPerMonth));
  const monthlyKwh = loadKw * hours * days;

  const dieselCostPerKwh =
    r.dieselPriceBdtPerLitre / r.dieselKwhPerLitre + r.dieselMaintenanceBdtPerKwh;
  const gridRate = input.rateClass === "commercial" ? r.commercialBdtPerKwh : r.industrialBdtPerKwh;
  // Battery charged from the grid; round-trip losses raise the effective rate.
  const bessCostPerKwh = gridRate / r.bessRoundTrip;

  const dieselMid = monthlyKwh * dieselCostPerKwh;
  const bessMid = monthlyKwh * bessCostPerKwh;
  const savingsMid = Math.max(0, dieselMid - bessMid);
  const pct = dieselMid > 0 ? (savingsMid / dieselMid) * 100 : 0;

  return {
    monthlyKwh: round(monthlyKwh),
    dieselCostPerKwh: Number(dieselCostPerKwh.toFixed(2)),
    bessCostPerKwh: Number(bessCostPerKwh.toFixed(2)),
    dieselMonthly: band(dieselMid),
    bessMonthly: band(bessMid),
    monthlySavings: band(savingsMid),
    annualSavings: band(savingsMid * 12),
    savingsPercent: {
      low: Math.round(pct * (1 - VARIANCE)),
      high: Math.min(100, Math.round(pct * (1 + VARIANCE))),
    },
  };
}
