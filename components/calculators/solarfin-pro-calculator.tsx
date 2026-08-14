"use client";

/**
 * SolarFin Pro — Bankable Tariff & LCOE Calculator
 *
 * Calculates Levelized Cost of Energy (LCOE) and the minimum bankable
 * tariff for commercial/industrial solar projects in Bangladesh.
 *
 * Formulas (NREL LCOE model):
 *   LCOE (BDT/kWh) = (Capex + PV(O&M) - Residual) / PV(Energy)
 *   where PV(O&M) = Σ O&M_t / (1 + r)^t
 *   and   PV(Energy) = Σ Energy_t / (1 + r)^t
 *
 *   Bankable tariff = LCOE × (1 + margin%)
 *   Debt service = annual_instalment (P&I over tenor)
 *   DSCR = annual_operating_income / annual_debt_service
 *   Payback = years to recover capex from net cash flow
 */

import { useState } from "react";
import {
  CalcButton,
  CalculatorShell,
  InputGroup,
  NumberInput,
  ResultCard,
  SelectInput,
} from "./calculator-shell";

interface Inputs {
  sizeKwp: string;
  costPerKwp: string;
  omCostPerKwp: string;
  peakSunHours: string;
  systemLossPct: string;
  degradationPct: string;
  discountRate: string;
  projectLife: string;
  debtPct: string;
  debtTenor: string;
  debtRate: string;
  marginPct: string;
  gridTariff: string;
}

interface Results {
  capex: number;
  annualGeneration: number;
  lcoe: number;
  bankableTariff: number;
  savingsVsGrid: number;
  paybackYears: number;
  dscr: number;
  npv: number;
  irr: number;
  annualDebtService: number;
}

const DEFAULTS: Inputs = {
  sizeKwp: "100",
  costPerKwp: "65000",
  omCostPerKwp: "1200",
  peakSunHours: "4.8",
  systemLossPct: "20",
  degradationPct: "0.5",
  discountRate: "10",
  projectLife: "25",
  debtPct: "70",
  debtTenor: "12",
  debtRate: "9",
  marginPct: "15",
  gridTariff: "9",
};

const GRID_TARIFF_OPTIONS = [
  { label: "9 BDT/kWh (BPDB commercial HV)", value: "9" },
  { label: "11 BDT/kWh (BPDB commercial LV)", value: "11" },
  { label: "14 BDT/kWh (BPDB industrial peak)", value: "14" },
  { label: "Custom", value: "custom" },
];

export function SolarfinProCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [customGrid, setCustomGrid] = useState("");
  const [gridMode, setGridMode] = useState("9");
  const [results, setResults] = useState<Results | null>(null);

  const set =
    (field: keyof Inputs) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setInputs((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const calculate = () => {
    const size = parseFloat(inputs.sizeKwp) || 0;
    const capexPerKwp = parseFloat(inputs.costPerKwp) || 0;
    const omPerKwp = parseFloat(inputs.omCostPerKwp) || 0;
    const psh = parseFloat(inputs.peakSunHours) || 0;
    const loss = parseFloat(inputs.systemLossPct) / 100;
    const deg = parseFloat(inputs.degradationPct) / 100;
    const discount = parseFloat(inputs.discountRate) / 100;
    const life = Math.max(1, parseInt(inputs.projectLife) || 25);
    const debtShare = parseFloat(inputs.debtPct) / 100;
    const tenor = Math.max(1, parseInt(inputs.debtTenor) || 12);
    const debtInt = parseFloat(inputs.debtRate) / 100;
    const margin = parseFloat(inputs.marginPct) / 100;
    const gridRate = parseFloat(gridMode === "custom" ? customGrid : gridMode) || 0;

    // ── Capex ─────────────────────────────────────────────────────────────────
    const capex = size * capexPerKwp;
    const equityCapex = capex * (1 - debtShare);
    const debtCapex = capex * debtShare;

    // ── Annual generation (year 1) ────────────────────────────────────────────
    const dailyKwh = size * psh * (1 - loss);
    const annualGenY1 = dailyKwh * 365;

    // ── Annual O&M ────────────────────────────────────────────────────────────
    const annualOm = size * omPerKwp;

    // ── Debt service (annual P&I instalment, constant payment) ────────────────
    const monthlyRate = debtInt / 12;
    const totalMonths = tenor * 12;
    const monthlyInstalment =
      monthlyRate > 0
        ? (debtCapex * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
          (Math.pow(1 + monthlyRate, totalMonths) - 1)
        : debtCapex / totalMonths;
    const annualDebtService = monthlyInstalment * 12;

    // ── LCOE: PV of costs / PV of energy ─────────────────────────────────────
    let pvCosts = 0;
    let pvEnergy = 0;
    let annualRev = 0;

    // Build cash flows year by year
    const cashFlows: number[] = [-equityCapex]; // Year 0 = equity investment

    for (let y = 1; y <= life; y++) {
      const degFactor = Math.pow(1 - deg, y - 1);
      const gen = annualGenY1 * degFactor;
      const energyPv = gen / Math.pow(1 + discount, y);

      // O&M cost (escalation: 2% annual)
      const omEscalated = annualOm * Math.pow(1.02, y - 1);
      const omPv = omEscalated / Math.pow(1 + discount, y);

      // Debt service only during tenor
      const ds = y <= tenor ? annualDebtService : 0;

      // Revenue from grid savings
      const revenue = gen * gridRate;

      pvCosts += omPv;
      pvEnergy += energyPv;

      // Net cash flow for IRR (equity perspective)
      const netCf = revenue - omEscalated - ds;
      cashFlows.push(netCf);
      annualRev += revenue;
    }

    // Residual value (10% of capex at end of life, discounted)
    const residualPct = 0.10;
    const residualPv = (capex * residualPct) / Math.pow(1 + discount, life);

    // Total PV costs = capex + PV(O&M) - PV(residual)
    const totalPvCosts = capex + pvCosts - residualPv;
    const lcoe = totalPvCosts / pvEnergy;
    const bankableTariff = lcoe * (1 + margin);
    const avgAnnualRevenue = annualGenY1 * (1 - deg * (life / 2)) * gridRate;
    const savingsVsGrid = avgAnnualRevenue * life - totalPvCosts;

    // ── Payback (simple) ──────────────────────────────────────────────────────
    let cumCash = -equityCapex;
    let paybackYears = -1;
    for (let y = 1; y <= life; y++) {
      const degFactor = Math.pow(1 - deg, y - 1);
      const gen = annualGenY1 * degFactor;
      const omEsc = annualOm * Math.pow(1.02, y - 1);
      const revenue = gen * gridRate;
      const ds = y <= tenor ? annualDebtService : 0;
      cumCash += revenue - omEsc - ds;
      if (cumCash >= 0 && paybackYears < 0) {
        paybackYears = y;
      }
    }
    if (paybackYears < 0) paybackYears = life; // Never paid back within life

    // ── NPV ───────────────────────────────────────────────────────────────────
    // Rebuild from equity perspective
    let npv = -equityCapex;
    for (let y = 1; y <= life; y++) {
      const degFactor = Math.pow(1 - deg, y - 1);
      const gen = annualGenY1 * degFactor;
      const omEsc = annualOm * Math.pow(1.02, y - 1);
      const revenue = gen * gridRate;
      const ds = y <= tenor ? annualDebtService : 0;
      const netCf = revenue - omEsc - ds;
      npv += netCf / Math.pow(1 + discount, y);
    }
    // Add residual
    npv += (capex * residualPct) / Math.pow(1 + discount, life);

    // ── IRR (equity, via Newton-Raphson) ──────────────────────────────────────
    const irr = solveIRR(cashFlows);

    // ── DSCR (Debt Service Coverage Ratio — average over tenor) ───────────────
    let totalDscrNumerator = 0;
    for (let y = 1; y <= tenor; y++) {
      const degFactor = Math.pow(1 - deg, y - 1);
      const gen = annualGenY1 * degFactor;
      const omEsc = annualOm * Math.pow(1.02, y - 1);
      const revenue = gen * gridRate;
      totalDscrNumerator += revenue - omEsc;
    }
    const avgAnnualIncome = totalDscrNumerator / tenor;
    const dscr = annualDebtService > 0 ? avgAnnualIncome / annualDebtService : 999;

    setResults({
      capex,
      annualGeneration: annualGenY1,
      lcoe,
      bankableTariff,
      savingsVsGrid: Math.max(savingsVsGrid, 0),
      paybackYears,
      dscr,
      npv,
      irr,
      annualDebtService,
    });
  };

  const reset = () => setResults(null);

  const fmt = (n: number) => new Intl.NumberFormat("en-BD").format(Math.round(n));
  const fmtDec = (n: number, d = 2) => n.toFixed(d);

  return (
    <CalculatorShell
      title="SolarFin Pro — Bankable Tariff & LCOE"
      description="Calculate the Levelized Cost of Energy (LCOE) and minimum bankable tariff for commercial and industrial solar projects in Bangladesh. Includes debt financing, NPV, IRR, and DSCR analysis."
      hasResults={results !== null}
      onReset={reset}
      inputs={
        <>
          {/* ── System parameters ───────────────────────────────────────── */}
          <h3 className="text-ink-800 mb-3 text-sm font-semibold uppercase tracking-wider">
            System Parameters
          </h3>

          <InputGroup label="System size" hint="Total installed peak power.">
            <NumberInput
              value={inputs.sizeKwp}
              onChange={set("sizeKwp")}
              min="1"
              step="10"
              unit="kWp"
            />
          </InputGroup>

          <InputGroup
            label="Installed cost per kWp"
            hint="All-in EPC cost: BDT 55,000 – 80,000/kWp (2026)."
          >
            <NumberInput
              value={inputs.costPerKwp}
              onChange={set("costPerKwp")}
              min="1"
              step="5000"
              unit="BDT/kWp"
            />
          </InputGroup>

          <InputGroup
            label="Annual O&M per kWp"
            hint="Cleaning, monitoring, insurance. Typical: BDT 1,000 – 1,500/kWp/yr."
          >
            <NumberInput
              value={inputs.omCostPerKwp}
              onChange={set("omCostPerKwp")}
              min="0"
              step="100"
              unit="BDT/kWp/yr"
            />
          </InputGroup>

          <InputGroup
            label="Peak sun hours (PSH)"
            hint="Bangladesh average: 4.5–5.5 h/day. Chattogram ≈ 4.95 h/day."
          >
            <NumberInput
              value={inputs.peakSunHours}
              onChange={set("peakSunHours")}
              min="3"
              max="7"
              step="0.1"
              unit="h/day"
            />
          </InputGroup>

          <InputGroup
            label="System losses"
            hint="Wiring, inverter, soiling, temperature. Typical: 18–24%."
          >
            <NumberInput
              value={inputs.systemLossPct}
              onChange={set("systemLossPct")}
              min="5"
              max="40"
              step="1"
              unit="%"
            />
          </InputGroup>

          <InputGroup
            label="Annual degradation"
            hint="Module degradation per year. Typical: 0.5–0.7%/yr."
          >
            <NumberInput
              value={inputs.degradationPct}
              onChange={set("degradationPct")}
              min="0.1"
              max="2"
              step="0.1"
              unit="%/yr"
            />
          </InputGroup>

          <InputGroup
            label="Project life"
            hint="Typically 20–25 years for solar PV."
          >
            <NumberInput
              value={inputs.projectLife}
              onChange={set("projectLife")}
              min="5"
              max="30"
              step="5"
              unit="years"
            />
          </InputGroup>

          {/* ── Financial parameters ──────────────────────────────────────── */}
          <h3 className="text-ink-800 mt-6 mb-3 text-sm font-semibold uppercase tracking-wider">
            Financial Parameters
          </h3>

          <InputGroup
            label="Discount rate (WACC)"
            hint="Weighted average cost of capital. Bangladesh solar: 9–14%."
          >
            <NumberInput
              value={inputs.discountRate}
              onChange={set("discountRate")}
              min="2"
              max="20"
              step="0.5"
              unit="%"
            />
          </InputGroup>

          <InputGroup
            label="Grid tariff"
            hint="Current grid electricity rate the solar replaces."
          >
            <SelectInput
              value={gridMode}
              onChange={(e) => {
                setGridMode(e.target.value);
                if (e.target.value !== "custom") setCustomGrid("");
              }}
              options={GRID_TARIFF_OPTIONS}
            />
            {gridMode === "custom" && (
              <div className="mt-2">
                <NumberInput
                  value={customGrid}
                  onChange={(e) => setCustomGrid(e.target.value)}
                  min="1"
                  step="1"
                  unit="BDT/kWh"
                />
              </div>
            )}
          </InputGroup>

          <InputGroup
            label="Target equity margin"
            hint="Profit margin on LCOE for bankable tariff. Typical: 10–20%."
          >
            <NumberInput
              value={inputs.marginPct}
              onChange={set("marginPct")}
              min="0"
              max="50"
              step="2"
              unit="%"
            />
          </InputGroup>

          {/* ── Debt financing ──────────────────────────────────────────── */}
          <h3 className="text-ink-800 mt-6 mb-3 text-sm font-semibold uppercase tracking-wider">
            Debt Financing
          </h3>

          <InputGroup
            label="Debt financing share"
            hint="Percentage of capex financed by debt. Banks lend 60–80%."
          >
            <NumberInput
              value={inputs.debtPct}
              onChange={set("debtPct")}
              min="0"
              max="90"
              step="5"
              unit="%"
            />
          </InputGroup>

          <InputGroup
            label="Loan tenor"
            hint="Repayment period. Bangladesh solar loans: 10–15 years."
          >
            <NumberInput
              value={inputs.debtTenor}
              onChange={set("debtTenor")}
              min="1"
              max="20"
              step="1"
              unit="years"
            />
          </InputGroup>

          <InputGroup
            label="Interest rate"
            hint="Annual interest rate. Bangladesh solar: 8–12%."
          >
            <NumberInput
              value={inputs.debtRate}
              onChange={set("debtRate")}
              min="2"
              max="18"
              step="0.5"
              unit="%"
            />
          </InputGroup>

          <CalcButton onClick={calculate} />
        </>
      }
      results={
        results && (
          <>
            {/* ── Primary metrics ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3">
              <ResultCard
                label="LCOE"
                value={`${fmtDec(results.lcoe, 2)} BDT/kWh`}
                subtext={`Levelized cost over ${inputs.projectLife} yr`}
                highlight
              />
              <ResultCard
                label="Bankable Tariff"
                value={`${fmtDec(results.bankableTariff, 2)} BDT/kWh`}
                subtext={`LCOE + ${inputs.marginPct}% margin`}
                highlight
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ResultCard
                label="Total Capex"
                value={`BDT ${fmt(results.capex)}`}
                subtext={`${fmt(results.capex / (parseFloat(inputs.sizeKwp) || 1))} BDT/kWp`}
              />
              <ResultCard
                label="Annual Generation"
                value={`${fmt(results.annualGeneration)} kWh`}
                subtext={`Year 1, ${inputs.peakSunHours} PSH`}
              />
            </div>

            {/* ── Financial returns ───────────────────────────────────── */}
            <h4 className="text-ink-800 border-border border-b pb-2 text-sm font-semibold uppercase tracking-wider">
              Financial Returns
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <ResultCard
                label="NPV (Equity)"
                value={`BDT ${fmt(results.npv)}`}
                subtext={results.npv >= 0 ? "✅ Positive — viable" : "⚠️ Negative — review inputs"}
              />
              <ResultCard
                label="IRR (Equity)"
                value={`${fmtDec(results.irr, 1)}%`}
                subtext={
                  results.irr >= (parseFloat(inputs.discountRate) || 10)
                    ? "✅ Above WACC"
                    : "⚠️ Below WACC"
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ResultCard
                label="Payback Period"
                value={
                  results.paybackYears < (parseFloat(inputs.projectLife) || 25)
                    ? `~${fmtDec(results.paybackYears, 0)} yr`
                    : "> Project life"
                }
                subtext="Equity payback (simple)"
              />
              <ResultCard
                label="25-yr Grid Savings"
                value={`BDT ${fmt(results.savingsVsGrid)}`}
                subtext="Gross savings vs grid"
              />
            </div>

            {/* ── Debt metrics ────────────────────────────────────────── */}
            <h4 className="text-ink-800 border-border border-b pb-2 text-sm font-semibold uppercase tracking-wider">
              Debt Metrics
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <ResultCard
                label="Annual Debt Service"
                value={`BDT ${fmt(results.annualDebtService)}`}
                subtext={`P&I over ${inputs.debtTenor} yr @ ${inputs.debtRate}%`}
              />
              <ResultCard
                label="DSCR"
                value={fmtDec(results.dscr, 2)}
                subtext={
                  results.dscr >= 1.3
                    ? "✅ Bankable (≥ 1.3x)"
                    : results.dscr >= 1.15
                      ? "⚠️ Marginal (≥ 1.15x)"
                      : "❌ Below minimum"
                }
              />
            </div>
          </>
        )
      }
    />
  );
}

// ── IRR solver (Newton-Raphson) ─────────────────────────────────────────────────

function solveIRR(cashFlows: number[], guess = 0.12): number {
  const maxIter = 100;
  const tolerance = 1e-6;
  let rate = guess;

  for (let i = 0; i < maxIter; i++) {
    let npv = 0;
    let dnpv = 0; // derivative

    for (let t = 0; t < cashFlows.length; t++) {
      const cf = cashFlows[t];
      if (cf === undefined) continue;
      const factor = Math.pow(1 + rate, -t);
      npv += cf * factor;
      dnpv += -t * cf * factor / (1 + rate);
    }

    if (Math.abs(npv) < tolerance) return rate * 100; // convert to percentage
    if (dnpv === 0) break;

    const newRate = rate - npv / dnpv;
    if (Math.abs(newRate - rate) < tolerance) return newRate * 100;
    rate = newRate;
  }

  // Fallback: return a reasonable approximation
  return rate * 100;
}