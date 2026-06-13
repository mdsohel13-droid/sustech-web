"use client";

/**
 * Outage cost estimator — what unplanned power cuts cost per month/year.
 * Optionally shows the diesel running cost it would take to cover them
 * (cited tariff). Ends with the email-report-gate (lead capture).
 */

import { useState } from "react";
import { outageCost } from "@/lib/calc-formulas";
import { DEFAULT_TARIFFS, type TariffSnapshot } from "@/lib/tariffs";
import {
  CalcButton,
  CalculatorShell,
  InputGroup,
  NumberInput,
  ResultCard,
} from "./calculator-shell";
import type { ReportPayload } from "./email-report-gate";

interface Inputs {
  revenuePerHour: string;
  outageHoursPerMonth: string;
  idleStaffCostPerHour: string;
  backupKwhPerMonth: string;
}

const DEFAULTS: Inputs = {
  revenuePerHour: "50000",
  outageHoursPerMonth: "20",
  idleStaffCostPerHour: "8000",
  backupKwhPerMonth: "2000",
};

const fmt = (n: number) => new Intl.NumberFormat("en-BD").format(Math.round(n));
const range = (lo: number, hi: number) => `BDT ${fmt(lo)} – ${fmt(hi)}`;

export function OutageCostCalculator({ rates = DEFAULT_TARIFFS }: { rates?: TariffSnapshot }) {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<ReturnType<typeof outageCost> | null>(null);

  const calculate = () =>
    setResult(
      outageCost(
        {
          revenuePerHour: parseFloat(inputs.revenuePerHour) || 0,
          outageHoursPerMonth: parseFloat(inputs.outageHoursPerMonth) || 0,
          idleStaffCostPerHour: parseFloat(inputs.idleStaffCostPerHour) || 0,
          backupKwhPerMonth: parseFloat(inputs.backupKwhPerMonth) || 0,
        },
        rates,
      ),
    );

  const reportPayload: ReportPayload | null = result
    ? { calculator: "outage-cost", title: "Cost of power outages", data: { inputs, result } }
    : null;

  return (
    <CalculatorShell
      title="Cost of power outages"
      description="Estimate what unplanned load-shedding costs your operation each month — lost revenue plus idle staff — and the diesel running cost of covering it."
      hasResults={result !== null}
      onReset={() => setResult(null)}
      reportPayload={reportPayload}
      inputs={
        <>
          <InputGroup
            label="Lost value per hour down"
            hint="Revenue or production value lost / hour."
          >
            <NumberInput
              value={inputs.revenuePerHour}
              onChange={(e) => setInputs((p) => ({ ...p, revenuePerHour: e.target.value }))}
              min="0"
              step="1000"
              unit="BDT"
            />
          </InputGroup>
          <InputGroup label="Outage hours per month">
            <NumberInput
              value={inputs.outageHoursPerMonth}
              onChange={(e) => setInputs((p) => ({ ...p, outageHoursPerMonth: e.target.value }))}
              min="0"
              step="1"
              unit="h"
            />
          </InputGroup>
          <InputGroup label="Idle staff cost per hour" hint="Optional — wages paid while down.">
            <NumberInput
              value={inputs.idleStaffCostPerHour}
              onChange={(e) => setInputs((p) => ({ ...p, idleStaffCostPerHour: e.target.value }))}
              min="0"
              step="500"
              unit="BDT"
            />
          </InputGroup>
          <InputGroup
            label="Backup energy per month"
            hint="Optional — kWh you currently run on diesel."
          >
            <NumberInput
              value={inputs.backupKwhPerMonth}
              onChange={(e) => setInputs((p) => ({ ...p, backupKwhPerMonth: e.target.value }))}
              min="0"
              step="100"
              unit="kWh"
            />
          </InputGroup>
          <CalcButton onClick={calculate}>Estimate the cost</CalcButton>
        </>
      }
      results={
        result && (
          <>
            <ResultCard
              label="Indicative monthly cost of outages"
              value={range(result.monthlyLoss.low, result.monthlyLoss.high)}
              highlight
              subtext="Lost value + idle staff"
            />
            <ResultCard
              label="Indicative annual cost"
              value={range(result.annualLoss.low, result.annualLoss.high)}
            />
            {result.dieselBackupMonthly && (
              <ResultCard
                label="Diesel running cost to cover it"
                value={range(result.dieselBackupMonthly.low, result.dieselBackupMonthly.high)}
                subtext={`Energy only · ${rates.dieselSourceLabel}`}
              />
            )}
            <div className="border-border text-text-soft rounded-lg border border-dashed p-3 text-xs">
              <strong>Indicative estimate — not a quote or guarantee.</strong> Based on the values
              you entered; a Solar + LFP BESS assessment quantifies the avoidable share.
            </div>
          </>
        )
      }
    />
  );
}
