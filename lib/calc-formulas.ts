/**
 * Additional calculator math (Lead Engine master plan §3.3). PURE, unit-tested.
 * Same rules as lib/tariffs.ts: only user inputs + cited rates feed a formula;
 * cost outputs are ranges, labelled indicative by the UI.
 */
import type { MoneyRange, TariffSnapshot } from "@/lib/tariffs";

const round = (n: number): number => Math.round(n);
const VARIANCE = 0.1;
const band = (mid: number): MoneyRange => ({
  low: round(mid * (1 - VARIANCE)),
  high: round(mid * (1 + VARIANCE)),
});

// ── ATM / branch UPS sizing (banks) ──────────────────────────────────────────
export interface AtmUpsInput {
  units: number; // number of ATMs / loads
  loadWattsPerUnit: number; // VA → W; per-ATM load
  backupMinutes: number; // required autonomy
  powerFactor: number; // 0.8–1.0
  batteryVoltage: number; // DC bus, e.g. 12, 24, 48
  depthOfDischarge: number; // 0–1, e.g. 0.8 for LFP
}

export interface AtmUpsResult {
  totalLoadWatts: number;
  upsRatingKva: number; // recommended UPS apparent power, +25% headroom
  energyWh: number; // energy needed over the backup window
  batteryAh: number; // battery capacity at the chosen bus voltage
  batteryKwh: number;
}

/** Size a UPS + battery bank for N ATMs/branch loads. Deterministic. */
export function atmUpsSizing(i: AtmUpsInput): AtmUpsResult {
  const units = Math.max(0, i.units);
  const totalW = units * Math.max(0, i.loadWattsPerUnit);
  const pf = Math.min(1, Math.max(0.6, i.powerFactor || 0.9));
  const dod = Math.min(1, Math.max(0.3, i.depthOfDischarge || 0.8));
  const v = Math.max(1, i.batteryVoltage || 48);
  const mins = Math.max(0, i.backupMinutes);

  const upsRatingKva = (totalW / pf / 1000) * 1.25; // +25% headroom
  const energyWh = totalW * (mins / 60);
  // Usable energy must exceed needed energy → divide by DoD, then by bus V.
  const batteryAh = v > 0 ? energyWh / dod / v : 0;

  return {
    totalLoadWatts: round(totalW),
    upsRatingKva: Number(upsRatingKva.toFixed(2)),
    energyWh: round(energyWh),
    batteryAh: round(batteryAh),
    batteryKwh: Number((energyWh / dod / 1000).toFixed(2)),
  };
}

// ── Outage cost estimator ────────────────────────────────────────────────────
export interface OutageCostInput {
  revenuePerHour: number; // lost revenue / production value per hour down
  outageHoursPerMonth: number;
  idleStaffCostPerHour?: number; // optional: wages paid during downtime
  /** Diesel backup currently covering the outage? Its running cost offsets nothing
   *  but is shown for context (energy cost of the diesel that this would replace). */
  backupKwhPerMonth?: number;
}

export interface OutageCostResult {
  monthlyLoss: MoneyRange;
  annualLoss: MoneyRange;
  dieselBackupMonthly?: MoneyRange; // context only
}

/** Estimate the monthly/annual cost of unplanned outages. Ranges. */
export function outageCost(i: OutageCostInput, rates?: TariffSnapshot): OutageCostResult {
  const hours = Math.max(0, i.outageHoursPerMonth);
  const perHour = Math.max(0, i.revenuePerHour) + Math.max(0, i.idleStaffCostPerHour ?? 0);
  const monthlyMid = perHour * hours;

  const out: OutageCostResult = {
    monthlyLoss: band(monthlyMid),
    annualLoss: band(monthlyMid * 12),
  };

  if (rates && i.backupKwhPerMonth && i.backupKwhPerMonth > 0) {
    const dieselPerKwh =
      rates.dieselPriceBdtPerLitre / rates.dieselKwhPerLitre + rates.dieselMaintenanceBdtPerKwh;
    out.dieselBackupMonthly = band(i.backupKwhPerMonth * dieselPerKwh);
  }
  return out;
}
