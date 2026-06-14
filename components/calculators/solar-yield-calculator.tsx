"use client";

/**
 * Solar Energy Yield Estimate
 *
 * Formula:
 *   Annual kWh = P_nom (kWp) × PSH (h/day) × 365 × PR
 *
 * Where:
 *   P_nom = Installed peak power (kWp)
 *   PSH   = Peak Sun Hours (location-specific daily irradiance ÷ 1 kW/m²)
 *   PR    = Performance Ratio (accounts for temperature, wiring, inverter, soiling)
 *           Typical: 0.75–0.82 for fixed-tilt, 0.78–0.85 after soiling correction
 *
 * Bangladesh location PSH averages (from NASA POWER / IRENA Global Atlas):
 *   Dhaka:       4.8 h/day (avg), range 3.8 (Dec) – 6.2 (Apr)
 *   Chittagong:  4.9 h/day
 *   Sylhet:      4.5 h/day (more cloud cover)
 *   Rajshahi:    5.2 h/day (clearer skies)
 *   Khulna:      5.0 h/day
 *   Custom:      user-entered
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

const LOCATIONS = [
  { label: "Dhaka (4.8 h/day)", value: "4.8" },
  { label: "Chittagong (4.9 h/day)", value: "4.9" },
  { label: "Rajshahi (5.2 h/day)", value: "5.2" },
  { label: "Khulna (5.0 h/day)", value: "5.0" },
  { label: "Sylhet (4.5 h/day)", value: "4.5" },
  { label: "Cox's Bazar (5.1 h/day)", value: "5.1" },
  { label: "Custom — enter PSH", value: "custom" },
];

const MOUNT_OPTIONS = [
  { label: "Fixed tilt, rooftop (PR ≈ 0.78)", value: "0.78" },
  { label: "Fixed tilt, ground mount (PR ≈ 0.80)", value: "0.80" },
  { label: "Dual-axis tracker (PR ≈ 0.84)", value: "0.84" },
  { label: "BIPV / facade (PR ≈ 0.70)", value: "0.70" },
  { label: "Custom PR", value: "custom" },
];

interface Results {
  annualKwh: number;
  monthlyAvgKwh: number;
  dailyAvgKwh: number;
  specificYield: number; // kWh/kWp/year
  co2Avoided: number; // tCO₂/year
}

export function SolarYieldCalculator() {
  const [sizeKwp, setSizeKwp] = useState("50");
  const [locationMode, setLocationMode] = useState("4.8");
  const [customPsh, setCustomPsh] = useState("");
  const [mountMode, setMountMode] = useState("0.78");
  const [customPr, setCustomPr] = useState("");
  const [tariff, setTariff] = useState("9");
  const [results, setResults] = useState<Results | null>(null);

  const calculate = () => {
    const P = parseFloat(sizeKwp) || 0;
    const PSH = parseFloat(locationMode === "custom" ? customPsh : locationMode) || 0;
    const PR = parseFloat(mountMode === "custom" ? customPr : mountMode) || 0;

    if (P <= 0 || PSH <= 0 || PR <= 0) return;

    const annualKwh = P * PSH * 365 * PR;
    setResults({
      annualKwh,
      monthlyAvgKwh: annualKwh / 12,
      dailyAvgKwh: annualKwh / 365,
      specificYield: annualKwh / P,
      co2Avoided: annualKwh * 0.000678,
    });
  };

  const reset = () => setResults(null);
  const fmt = (n: number, d = 0) => new Intl.NumberFormat("en-BD").format(parseFloat(n.toFixed(d)));
  const fmtDec = (n: number, d = 2) => n.toFixed(d);
  const tariffNum = parseFloat(tariff) || 9;

  return (
    <CalculatorShell
      title="Solar Energy Yield Estimate"
      description="Estimate annual electricity generation and financial value of a solar PV system based on Bangladesh irradiance data and IEC performance ratio standards."
      hasResults={results !== null}
      onReset={reset}
      inputs={
        <>
          <InputGroup label="System size">
            <NumberInput
              value={sizeKwp}
              onChange={(e) => setSizeKwp(e.target.value)}
              min="1"
              step="5"
              unit="kWp"
            />
          </InputGroup>

          <InputGroup
            label="Location (Peak Sun Hours)"
            hint="Based on long-term NASA POWER data. Use a site-specific study for bankable analysis."
          >
            <SelectInput
              options={LOCATIONS}
              value={locationMode}
              onChange={(e) => setLocationMode(e.target.value)}
            />
            {locationMode === "custom" && (
              <NumberInput
                className="mt-2"
                value={customPsh}
                onChange={(e) => setCustomPsh(e.target.value)}
                placeholder="e.g. 4.8"
                min="2"
                max="8"
                step="0.1"
                unit="h/day"
              />
            )}
          </InputGroup>

          <InputGroup
            label="Mounting type (Performance Ratio)"
            hint="PR accounts for temperature losses, inverter efficiency, soiling, wiring."
          >
            <SelectInput
              options={MOUNT_OPTIONS}
              value={mountMode}
              onChange={(e) => setMountMode(e.target.value)}
            />
            {mountMode === "custom" && (
              <NumberInput
                className="mt-2"
                value={customPr}
                onChange={(e) => setCustomPr(e.target.value)}
                placeholder="e.g. 0.78"
                min="0.5"
                max="0.95"
                step="0.01"
              />
            )}
          </InputGroup>

          <InputGroup
            label="Electricity tariff (for savings estimate)"
            hint="BPDB commercial rate."
          >
            <NumberInput
              value={tariff}
              onChange={(e) => setTariff(e.target.value)}
              min="1"
              step="0.5"
              unit="BDT/kWh"
            />
          </InputGroup>

          <CalcButton onClick={calculate} />
        </>
      }
      results={
        results && (
          <>
            <ResultCard
              label="Annual energy generation"
              value={`${fmt(results.annualKwh)} kWh`}
              highlight
            />
            <ResultCard
              label="Monthly average"
              value={`${fmt(results.monthlyAvgKwh)} kWh`}
              subtext={`Daily average: ${fmtDec(results.dailyAvgKwh, 1)} kWh/day`}
            />
            <ResultCard
              label="Specific yield"
              value={`${fmt(results.specificYield)} kWh/kWp`}
              subtext="Annual production per kWp installed — benchmark for this location"
            />
            <ResultCard
              label="Estimated annual savings"
              value={`BDT ${fmt(results.annualKwh * tariffNum)}`}
              highlight
              subtext={`At BDT ${tariff}/kWh tariff`}
            />
            <ResultCard
              label="CO₂ emissions avoided"
              value={`${fmtDec(results.co2Avoided, 2)} tCO₂/yr`}
              subtext="Bangladesh grid factor: 0.678 kg CO₂/kWh (SREDA 2023)"
            />
          </>
        )
      }
    />
  );
}
