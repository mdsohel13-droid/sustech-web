import { describe, expect, it } from "vitest";
import { atmUpsSizing, outageCost } from "@/lib/calc-formulas";
import { DEFAULT_TARIFFS } from "@/lib/tariffs";

describe("atmUpsSizing", () => {
  it("sizes UPS with +25% headroom over the PF-adjusted load", () => {
    const r = atmUpsSizing({
      units: 4,
      loadWattsPerUnit: 350,
      backupMinutes: 30,
      powerFactor: 0.9,
      batteryVoltage: 48,
      depthOfDischarge: 0.8,
    });
    expect(r.totalLoadWatts).toBe(1400);
    // 1400 / 0.9 / 1000 * 1.25 ≈ 1.94 kVA
    expect(r.upsRatingKva).toBeCloseTo(1.94, 1);
    expect(r.energyWh).toBe(700); // 1400 W × 0.5 h
    // 700 / 0.8 / 48 ≈ 18.2 Ah
    expect(r.batteryAh).toBe(18);
  });
  it("no NaN on zero input", () => {
    const r = atmUpsSizing({
      units: 0,
      loadWattsPerUnit: 0,
      backupMinutes: 0,
      powerFactor: 0.9,
      batteryVoltage: 48,
      depthOfDischarge: 0.8,
    });
    expect(r.totalLoadWatts).toBe(0);
    expect(Number.isNaN(r.batteryAh)).toBe(false);
  });
});

describe("outageCost", () => {
  it("sums lost revenue + idle staff into a monthly/annual range", () => {
    const r = outageCost({
      revenuePerHour: 50000,
      outageHoursPerMonth: 20,
      idleStaffCostPerHour: 8000,
    });
    // (50000+8000) × 20 = 1,160,000 mid
    expect(r.monthlyLoss.low).toBeLessThan(1_160_000);
    expect(r.monthlyLoss.high).toBeGreaterThan(1_160_000);
    expect(r.annualLoss.low).toBeGreaterThan(r.monthlyLoss.high);
    expect(r.dieselBackupMonthly).toBeUndefined(); // no backup kWh given
  });
  it("adds diesel context when backup kWh + rates provided", () => {
    const r = outageCost(
      { revenuePerHour: 10000, outageHoursPerMonth: 10, backupKwhPerMonth: 2000 },
      DEFAULT_TARIFFS,
    );
    expect(r.dieselBackupMonthly).toBeDefined();
    expect(r.dieselBackupMonthly!.high).toBeGreaterThan(r.dieselBackupMonthly!.low);
  });
  it("zero outage → zero loss, no NaN", () => {
    const r = outageCost({ revenuePerHour: 0, outageHoursPerMonth: 0 });
    expect(r.monthlyLoss.high).toBe(0);
    expect(Number.isNaN(r.annualLoss.low)).toBe(false);
  });
});
