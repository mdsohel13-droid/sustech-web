"use client";

/**
 * Solar ROI / Payback Period Calculator
 *
 * Formulas:
 *   System cost (BDT)       = size_kwp × cost_per_kwp
 *   Daily generation (kWh)  = size_kwp × peak_sun_hours × (1 - loss%)
 *   Annual generation (kWh) = daily × 365
 *   Annual savings (BDT)    = annual_kwh × tariff
 *   Simple payback (yr)     = system_cost / annual_savings
 *   25-yr net savings (BDT) = sum(annual_savings × degradation^n) - system_cost
 *   CO₂ avoided (tCO₂/yr)   = annual_kwh × 0.000678  [Bangladesh grid factor]
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
  peakSunHours: string;
  systemLossPct: string;
  tariff: string;
  degradationPct: string;
}

interface Results {
  systemCost: number;
  annualKwh: number;
  annualSavings: number;
  paybackYears: number;
  savings25yr: number;
  co2AvoidedTpa: number;
}

const DEFAULTS: Inputs = {
  sizeKwp: "100",
  costPerKwp: "65000",
  peakSunHours: "4.8",
  systemLossPct: "20",
  tariff: "9",
  degradationPct: "0.5",
};

const TARIFF_OPTIONS = [
  { label: "9 BDT/kWh (BPDB commercial HV)", value: "9" },
  { label: "11 BDT/kWh (BPDB commercial LV)", value: "11" },
  { label: "14 BDT/kWh (BPDB industrial peak)", value: "14" },
  { label: "Custom", value: "custom" },
];

export function SolarRoiCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [customTariff, setCustomTariff] = useState("");
  const [tariffMode, setTariffMode] = useState("9");
  const [results, setResults] = useState<Results | null>(null);

  const set =
    (field: keyof Inputs) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setInputs((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const calculate = () => {
    const size = parseFloat(inputs.sizeKwp) || 0;
    const costPerKwp = parseFloat(inputs.costPerKwp) || 0;
    const psh = parseFloat(inputs.peakSunHours) || 0;
    const loss = parseFloat(inputs.systemLossPct) / 100;
    const tariff = parseFloat(tariffMode === "custom" ? customTariff : tariffMode) || 0;
    const deg = parseFloat(inputs.degradationPct) / 100;

    const systemCost = size * costPerKwp;
    const dailyKwh = size * psh * (1 - loss);
    const annualKwh = dailyKwh * 365;
    const annualSavings = annualKwh * tariff;
    const paybackYears = annualSavings > 0 ? systemCost / annualSavings : Infinity;
    const co2AvoidedTpa = annualKwh * 0.000678;

    // 25-year net savings with annual degradation
    let savings25yr = -systemCost;
    for (let y = 1; y <= 25; y++) {
      const factor = Math.pow(1 - deg, y - 1);
      savings25yr += annualSavings * factor;
    }

    setResults({ systemCost, annualKwh, annualSavings, paybackYears, savings25yr, co2AvoidedTpa });
  };

  const reset = () => setResults(null);

  const fmt = (n: number) => new Intl.NumberFormat("en-BD").format(Math.round(n));
  const fmtDec = (n: number, d = 1) => n.toFixed(d);

  return (
    <CalculatorShell
      title="Solar ROI / Payback Period"
      description="Estimate the financial return on a commercial or industrial rooftop solar installation using Bangladesh grid tariffs and local irradiance."
      hasResults={results !== null}
      onReset={reset}
      inputs={
        <>
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
            hint="Typical range: BDT 60,000 – 80,000/kWp (2024)."
          >
            <NumberInput
              value={inputs.costPerKwp}
              onChange={set("costPerKwp")}
              min="1"
              step="1000"
              unit="BDT"
            />
          </InputGroup>

          <InputGroup
            label="Peak sun hours (PSH)"
            hint="Bangladesh average: 4.5–5.5 h/day. Dhaka ≈ 4.8 h/day."
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
            hint="Wiring, inverter, soiling, temperature. Typical: 18–22%."
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

          <InputGroup label="Electricity tariff">
            <SelectInput
              options={TARIFF_OPTIONS}
              value={tariffMode}
              onChange={(e) => setTariffMode(e.target.value)}
            />
            {tariffMode === "custom" && (
              <NumberInput
                className="mt-2"
                value={customTariff}
                onChange={(e) => setCustomTariff(e.target.value)}
                placeholder="Enter BDT/kWh"
                min="1"
                step="0.5"
                unit="BDT"
              />
            )}
          </InputGroup>

          <InputGroup
            label="Annual panel degradation"
            hint="Typical monocrystalline warranty: 0.5%/yr."
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

          <CalcButton onClick={calculate} />
        </>
      }
      results={
        results && (
          <>
            <ResultCard
              label="Simple payback period"
              value={isFinite(results.paybackYears) ? `${fmtDec(results.paybackYears)} years` : "—"}
              highlight
              subtext="Based on current tariff; O&M costs not included"
            />
            <ResultCard
              label="Annual energy generation"
              value={`${fmt(results.annualKwh)} kWh`}
              subtext={`≈ ${fmt(results.annualKwh / 30)} kWh/month`}
            />
            <ResultCard label="Annual bill savings" value={`BDT ${fmt(results.annualSavings)}`} />
            <ResultCard label="Total system cost" value={`BDT ${fmt(results.systemCost)}`} />
            <ResultCard
              label="25-year net savings"
              value={`BDT ${fmt(results.savings25yr)}`}
              subtext="After capital cost recovery, with annual degradation"
              highlight={results.savings25yr > 0}
            />
            <ResultCard
              label="CO₂ emissions avoided"
              value={`${fmtDec(results.co2AvoidedTpa, 2)} tCO₂/yr`}
              subtext="Based on Bangladesh grid emission factor 0.678 kg CO₂/kWh"
            />
          </>
        )
      }
    />
  );
}
