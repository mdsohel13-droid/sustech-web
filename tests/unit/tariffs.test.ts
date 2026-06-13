import { describe, expect, it } from "vitest";
import {
  DEFAULT_TARIFFS,
  dieselVsBess,
  toTariffSnapshot,
  type TariffSnapshot,
} from "@/lib/tariffs";

const rates: TariffSnapshot = { ...DEFAULT_TARIFFS };

describe("dieselVsBess", () => {
  it("computes monthly backup energy from load × hours × days", () => {
    const r = dieselVsBess(
      { loadKw: 100, outageHoursPerDay: 4, daysPerMonth: 26, rateClass: "industrial" },
      rates,
    );
    expect(r.monthlyKwh).toBe(100 * 4 * 26); // 10,400 kWh
  });

  it("makes diesel pricier than grid-charged BESS (so there is a saving)", () => {
    const r = dieselVsBess(
      { loadKw: 50, outageHoursPerDay: 3, daysPerMonth: 26, rateClass: "industrial" },
      rates,
    );
    expect(r.dieselCostPerKwh).toBeGreaterThan(r.bessCostPerKwh);
    expect(r.monthlySavings.low).toBeGreaterThan(0);
    expect(r.savingsPercent.high).toBeLessThanOrEqual(100);
  });

  it("returns RANGES (low < high), never a single point", () => {
    const r = dieselVsBess(
      { loadKw: 80, outageHoursPerDay: 5, daysPerMonth: 26, rateClass: "commercial" },
      rates,
    );
    expect(r.dieselMonthly.low).toBeLessThan(r.dieselMonthly.high);
    expect(r.monthlySavings.low).toBeLessThan(r.monthlySavings.high);
    expect(r.annualSavings.high).toBeGreaterThan(r.monthlySavings.high);
  });

  it("never uses the catalog 75% ceiling — savings derive from rates only", () => {
    // Make grid expensive enough that BESS is NOT cheaper → zero saving, not 75%.
    const pricey: TariffSnapshot = { ...rates, industrialBdtPerKwh: 999 };
    const r = dieselVsBess(
      { loadKw: 100, outageHoursPerDay: 4, daysPerMonth: 26, rateClass: "industrial" },
      pricey,
    );
    expect(r.monthlySavings.low).toBe(0);
    expect(r.savingsPercent.high).toBe(0);
  });

  it("zero load → zero everything (no NaN)", () => {
    const r = dieselVsBess(
      { loadKw: 0, outageHoursPerDay: 0, daysPerMonth: 0, rateClass: "industrial" },
      rates,
    );
    expect(r.monthlyKwh).toBe(0);
    expect(r.monthlySavings.high).toBe(0);
    expect(Number.isNaN(r.savingsPercent.low)).toBe(false);
  });
});

describe("toTariffSnapshot", () => {
  it("falls back to defaults when the global is null", () => {
    expect(toTariffSnapshot(null)).toEqual(DEFAULT_TARIFFS);
  });
  it("overlays provided CMS values over defaults", () => {
    const snap = toTariffSnapshot({ dieselPriceBdtPerLitre: 120 } as never);
    expect(snap.dieselPriceBdtPerLitre).toBe(120);
    expect(snap.industrialBdtPerKwh).toBe(DEFAULT_TARIFFS.industrialBdtPerKwh);
  });
});
