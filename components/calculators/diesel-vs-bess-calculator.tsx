"use client";

/**
 * Diesel generator vs Lithium (LFP) Battery Storage — running-cost calculator.
 * The flagship lead magnet (master plan §3.3). Compares the ENERGY cost of
 * backing up load with a diesel genset vs a grid/solar-charged LFP battery.
 *
 * Rules enforced:
 *  - formula uses only user inputs + cited tariff-rates (passed as `rates`);
 *  - every figure is a RANGE, labelled "indicative estimate — not a quote";
 *  - the "Rates source" line names BERC/BPC + the as-of date from the CMS;
 *  - capex is explicitly out of scope.
 */

import { useState } from "react";
import { dieselVsBess, DEFAULT_TARIFFS, type TariffSnapshot } from "@/lib/tariffs";
import {
  CalcButton,
  CalculatorShell,
  InputGroup,
  NumberInput,
  ResultCard,
  SelectInput,
} from "./calculator-shell";
import type { ReportPayload } from "./email-report-gate";

interface Inputs {
  loadKw: string;
  outageHoursPerDay: string;
  daysPerMonth: string;
  rateClass: "industrial" | "commercial";
}

const DEFAULTS: Inputs = {
  loadKw: "100",
  outageHoursPerDay: "4",
  daysPerMonth: "26",
  rateClass: "industrial",
};

const fmt = (n: number) => new Intl.NumberFormat("en-BD").format(Math.round(n));
const range = (lo: number, hi: number) => `BDT ${fmt(lo)} – ${fmt(hi)}`;

export function DieselVsBessCalculator({ rates = DEFAULT_TARIFFS }: { rates?: TariffSnapshot }) {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<ReturnType<typeof dieselVsBess> | null>(null);

  const calculate = () => {
    setResult(
      dieselVsBess(
        {
          loadKw: parseFloat(inputs.loadKw) || 0,
          outageHoursPerDay: parseFloat(inputs.outageHoursPerDay) || 0,
          daysPerMonth: parseFloat(inputs.daysPerMonth) || 0,
          rateClass: inputs.rateClass,
        },
        rates,
      ),
    );
  };

  const reportPayload: ReportPayload | null = result
    ? {
        calculator: "diesel-vs-bess",
        title: "Diesel vs Lithium BESS — running-cost estimate",
        data: { inputs, result, ratesSource: rates.electricitySourceLabel },
      }
    : null;

  const ratesAsOf = rates.electricityVerifiedAt
    ? new Date(rates.electricityVerifiedAt).toLocaleDateString("en-GB")
    : null;

  return (
    <CalculatorShell
      title="Diesel vs Lithium (LFP) Battery — running cost"
      description="Compare the monthly energy cost of backing up your load with a diesel generator versus a grid/solar-charged LFP battery, using Bangladesh tariffs."
      hasResults={result !== null}
      onReset={() => setResult(null)}
      reportPayload={reportPayload}
      inputs={
        <>
          <InputGroup label="Backed-up load" hint="Average load you run during an outage.">
            <NumberInput
              value={inputs.loadKw}
              onChange={(e) => setInputs((p) => ({ ...p, loadKw: e.target.value }))}
              min="1"
              step="5"
              unit="kW"
            />
          </InputGroup>
          <InputGroup label="Outage hours per day" hint="Average daily backup runtime.">
            <NumberInput
              value={inputs.outageHoursPerDay}
              onChange={(e) => setInputs((p) => ({ ...p, outageHoursPerDay: e.target.value }))}
              min="0"
              max="24"
              step="0.5"
              unit="h/day"
            />
          </InputGroup>
          <InputGroup label="Operating days per month">
            <NumberInput
              value={inputs.daysPerMonth}
              onChange={(e) => setInputs((p) => ({ ...p, daysPerMonth: e.target.value }))}
              min="1"
              max="31"
              step="1"
              unit="days"
            />
          </InputGroup>
          <InputGroup label="Grid rate class" hint="Which tariff charges the battery.">
            <SelectInput
              value={inputs.rateClass}
              onChange={(e) =>
                setInputs((p) => ({ ...p, rateClass: e.target.value as Inputs["rateClass"] }))
              }
              options={[
                { label: "Industrial", value: "industrial" },
                { label: "Commercial", value: "commercial" },
              ]}
            />
          </InputGroup>
          <CalcButton onClick={calculate}>Compare costs</CalcButton>
        </>
      }
      results={
        result && (
          <>
            <ResultCard
              label="Indicative monthly saving with LFP BESS"
              value={range(result.monthlySavings.low, result.monthlySavings.high)}
              highlight
              subtext={`≈ ${result.savingsPercent.low}–${result.savingsPercent.high}% lower than diesel · energy cost only`}
            />
            <ResultCard
              label="Diesel running cost / month"
              value={range(result.dieselMonthly.low, result.dieselMonthly.high)}
              subtext={`≈ BDT ${result.dieselCostPerKwh}/kWh (fuel + maintenance)`}
            />
            <ResultCard
              label="LFP BESS running cost / month"
              value={range(result.bessMonthly.low, result.bessMonthly.high)}
              subtext={`≈ BDT ${result.bessCostPerKwh}/kWh (grid + round-trip losses)`}
            />
            <ResultCard
              label="Indicative annual saving"
              value={range(result.annualSavings.low, result.annualSavings.high)}
              subtext={`Backup energy ≈ ${fmt(result.monthlyKwh)} kWh/month`}
            />
            <div className="border-border text-text-soft rounded-lg border border-dashed p-3 text-xs">
              <p>
                <strong>Indicative estimate — not a quote or guarantee.</strong> Energy (running)
                cost only; equipment capex, financing and solar self-generation are not included and
                change the picture materially.
              </p>
              <p className="mt-1">
                Rates source: {rates.electricitySourceLabel}
                {rates.dieselSourceLabel ? ` · ${rates.dieselSourceLabel}` : ""}
                {ratesAsOf ? ` (as of ${ratesAsOf})` : ""}.
              </p>
            </div>
          </>
        )
      }
    />
  );
}
