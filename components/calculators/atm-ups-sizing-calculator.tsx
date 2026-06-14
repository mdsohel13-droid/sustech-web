"use client";

/**
 * ATM / branch UPS + battery sizing (banks segment). Deterministic engineering
 * calc — no tariff data needed. Ends with the email-report-gate (lead capture).
 */

import { useState } from "react";
import { atmUpsSizing } from "@/lib/calc-formulas";
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
  units: string;
  loadWattsPerUnit: string;
  backupMinutes: string;
  powerFactor: string;
  batteryVoltage: string;
  depthOfDischarge: string;
}

const DEFAULTS: Inputs = {
  units: "4",
  loadWattsPerUnit: "350",
  backupMinutes: "30",
  powerFactor: "0.9",
  batteryVoltage: "48",
  depthOfDischarge: "0.8",
};

const fmt = (n: number) => new Intl.NumberFormat("en-BD").format(Math.round(n));

export function AtmUpsSizingCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<ReturnType<typeof atmUpsSizing> | null>(null);

  const calculate = () =>
    setResult(
      atmUpsSizing({
        units: parseFloat(inputs.units) || 0,
        loadWattsPerUnit: parseFloat(inputs.loadWattsPerUnit) || 0,
        backupMinutes: parseFloat(inputs.backupMinutes) || 0,
        powerFactor: parseFloat(inputs.powerFactor) || 0.9,
        batteryVoltage: parseFloat(inputs.batteryVoltage) || 48,
        depthOfDischarge: parseFloat(inputs.depthOfDischarge) || 0.8,
      }),
    );

  const reportPayload: ReportPayload | null = result
    ? {
        calculator: "atm-ups-sizing",
        title: "ATM / branch UPS sizing",
        segment: "bank",
        data: { inputs, result },
      }
    : null;

  return (
    <CalculatorShell
      title="ATM / branch UPS & battery sizing"
      description="Size an online UPS and battery bank to keep ATMs or a branch running through an outage. For banks and financial institutions."
      hasResults={result !== null}
      onReset={() => setResult(null)}
      reportPayload={reportPayload}
      inputs={
        <>
          <InputGroup label="Number of units (ATMs / loads)">
            <NumberInput
              value={inputs.units}
              onChange={(e) => setInputs((p) => ({ ...p, units: e.target.value }))}
              min="1"
              step="1"
            />
          </InputGroup>
          <InputGroup label="Load per unit" hint="Typical ATM: 300–500 W.">
            <NumberInput
              value={inputs.loadWattsPerUnit}
              onChange={(e) => setInputs((p) => ({ ...p, loadWattsPerUnit: e.target.value }))}
              min="50"
              step="50"
              unit="W"
            />
          </InputGroup>
          <InputGroup label="Required backup time">
            <NumberInput
              value={inputs.backupMinutes}
              onChange={(e) => setInputs((p) => ({ ...p, backupMinutes: e.target.value }))}
              min="5"
              step="5"
              unit="min"
            />
          </InputGroup>
          <InputGroup label="Battery bus voltage">
            <SelectInput
              value={inputs.batteryVoltage}
              onChange={(e) => setInputs((p) => ({ ...p, batteryVoltage: e.target.value }))}
              options={[
                { label: "12 V", value: "12" },
                { label: "24 V", value: "24" },
                { label: "48 V", value: "48" },
              ]}
            />
          </InputGroup>
          <InputGroup label="Power factor" hint="UPS output PF, typically 0.8–1.0.">
            <NumberInput
              value={inputs.powerFactor}
              onChange={(e) => setInputs((p) => ({ ...p, powerFactor: e.target.value }))}
              min="0.6"
              max="1"
              step="0.05"
            />
          </InputGroup>
          <InputGroup label="Depth of discharge" hint="LFP ≈ 0.8; lead-acid ≈ 0.5.">
            <NumberInput
              value={inputs.depthOfDischarge}
              onChange={(e) => setInputs((p) => ({ ...p, depthOfDischarge: e.target.value }))}
              min="0.3"
              max="1"
              step="0.05"
            />
          </InputGroup>
          <CalcButton onClick={calculate}>Size the system</CalcButton>
        </>
      }
      results={
        result && (
          <>
            <ResultCard
              label="Recommended UPS rating"
              value={`${result.upsRatingKva} kVA`}
              highlight
              subtext="Includes +25% headroom for inrush & future load"
            />
            <ResultCard label="Total connected load" value={`${fmt(result.totalLoadWatts)} W`} />
            <ResultCard
              label="Battery bank capacity"
              value={`${fmt(result.batteryAh)} Ah @ ${inputs.batteryVoltage} V`}
              subtext={`≈ ${result.batteryKwh} kWh usable energy`}
            />
            <ResultCard label="Energy over backup window" value={`${fmt(result.energyWh)} Wh`} />
          </>
        )
      }
    />
  );
}
