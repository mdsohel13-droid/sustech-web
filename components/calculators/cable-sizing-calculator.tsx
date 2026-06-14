"use client";

/**
 * Cable Sizing Calculator — Voltage Drop Method
 *
 * Determines the minimum cable cross-section so voltage drop stays within limit.
 *
 * Formula:
 *   Voltage drop (V) = (2 × ρ × L × I) / A         [single-phase]
 *   Voltage drop (V) = (√3 × ρ × L × I) / A         [three-phase]
 *
 * Rearranged for minimum cross-section:
 *   A_min (mm²) = (factor × ρ × L × I) / (V × vd%)
 *   where factor = 2 (single-phase) or √3 (three-phase)
 *
 * Resistivity:
 *   Copper:    0.01724 Ω·mm²/m at 20°C
 *   Aluminium: 0.02800 Ω·mm²/m at 20°C
 *   (derate for temperature per IEC 60228)
 *
 * Standard cable sizes (mm²): 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400
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

const STANDARD_SIZES = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400];

/** Copper: 0.01724, Aluminium: 0.0280 Ω·mm²/m at 20°C */
const RESISTIVITY: Record<string, number> = {
  copper: 0.01724,
  aluminium: 0.028,
};

/** Next standard size ≥ x */
function nextStandardSize(x: number): number {
  const found = STANDARD_SIZES.find((s) => s >= x);
  return found ?? 400; // largest standard size if x exceeds all
}

interface Results {
  calcArea: number;
  standardSize: number;
  actualVdPct: number;
  current: number;
}

export function CableSizingCalculator() {
  const [system, setSystem] = useState("three-phase");
  const [voltage, setVoltage] = useState("400");
  const [loadKw, setLoadKw] = useState("50");
  const [powerFactor, setPowerFactor] = useState("0.85");
  const [length, setLength] = useState("100");
  const [conductor, setConductor] = useState("copper");
  const [maxVdPct, setMaxVdPct] = useState("3");
  const [results, setResults] = useState<Results | null>(null);

  const calculate = () => {
    const V = parseFloat(voltage) || 0;
    const kW = parseFloat(loadKw) || 0;
    const pf = parseFloat(powerFactor) || 1;
    const L = parseFloat(length) || 0;
    const rho = RESISTIVITY[conductor] ?? 0.01724;
    const vdPct = parseFloat(maxVdPct) || 3;

    if (V <= 0 || kW <= 0 || L <= 0) return;

    // Calculate current
    const I =
      system === "three-phase" ? (kW * 1000) / (Math.sqrt(3) * V * pf) : (kW * 1000) / (V * pf);

    // factor: 2 for single-phase, √3 for three-phase
    const factor = system === "three-phase" ? Math.sqrt(3) : 2;

    // Max allowable voltage drop (V)
    const maxVd = V * (vdPct / 100);

    // Minimum cross-section
    const calcArea = (factor * rho * L * I) / maxVd;
    const standardSize = nextStandardSize(calcArea);

    // Actual voltage drop with selected standard size
    const actualVd = (factor * rho * L * I) / standardSize;
    const actualVdPct = (actualVd / V) * 100;

    setResults({ calcArea, standardSize, actualVdPct, current: I });
  };

  const reset = () => setResults(null);
  const fmt = (n: number, d = 2) => n.toFixed(d);

  return (
    <CalculatorShell
      title="Cable Sizing — Voltage Drop Method"
      description="Find the minimum copper or aluminium cable cross-section that keeps voltage drop within the allowable limit per IEC 60228 / IEC 60364."
      hasResults={results !== null}
      onReset={reset}
      inputs={
        <>
          <InputGroup label="System type">
            <SelectInput
              options={[
                { label: "Three-phase (400 V)", value: "three-phase" },
                { label: "Single-phase (230 V)", value: "single-phase" },
              ]}
              value={system}
              onChange={(e) => {
                setSystem(e.target.value);
                setVoltage(e.target.value === "three-phase" ? "400" : "230");
              }}
            />
          </InputGroup>

          <InputGroup label="Nominal voltage">
            <NumberInput
              value={voltage}
              onChange={(e) => setVoltage(e.target.value)}
              min="100"
              max="11000"
              step="10"
              unit="V"
            />
          </InputGroup>

          <InputGroup label="Load power">
            <NumberInput
              value={loadKw}
              onChange={(e) => setLoadKw(e.target.value)}
              min="0.1"
              step="1"
              unit="kW"
            />
          </InputGroup>

          <InputGroup label="Power factor" hint="Typical industrial: 0.80–0.95.">
            <NumberInput
              value={powerFactor}
              onChange={(e) => setPowerFactor(e.target.value)}
              min="0.5"
              max="1"
              step="0.01"
            />
          </InputGroup>

          <InputGroup label="Cable run length" hint="One-way distance from source to load.">
            <NumberInput
              value={length}
              onChange={(e) => setLength(e.target.value)}
              min="1"
              step="5"
              unit="m"
            />
          </InputGroup>

          <InputGroup label="Conductor material">
            <SelectInput
              options={[
                { label: "Copper (ρ = 0.01724 Ω·mm²/m)", value: "copper" },
                { label: "Aluminium (ρ = 0.0280 Ω·mm²/m)", value: "aluminium" },
              ]}
              value={conductor}
              onChange={(e) => setConductor(e.target.value)}
            />
          </InputGroup>

          <InputGroup
            label="Max allowable voltage drop"
            hint="IEC 60364-5-52 / BNBC: 3% for final circuits, 5% for distribution."
          >
            <SelectInput
              options={[
                { label: "3% (IEC 60364 final circuit)", value: "3" },
                { label: "5% (distribution / feeder)", value: "5" },
                { label: "2% (sensitive loads / data centres)", value: "2" },
                {
                  label: "Custom",
                  value:
                    maxVdPct !== "3" && maxVdPct !== "5" && maxVdPct !== "2" ? maxVdPct : "custom",
                },
              ]}
              value={["3", "5", "2"].includes(maxVdPct) ? maxVdPct : "custom"}
              onChange={(e) => {
                if (e.target.value !== "custom") setMaxVdPct(e.target.value);
              }}
            />
            {!["3", "5", "2"].includes(maxVdPct) && (
              <NumberInput
                className="mt-2"
                value={maxVdPct}
                onChange={(e) => setMaxVdPct(e.target.value)}
                min="0.5"
                max="10"
                step="0.5"
                unit="%"
              />
            )}
          </InputGroup>

          <CalcButton onClick={calculate} />
        </>
      }
      results={
        results && (
          <>
            <ResultCard
              label="Recommended cable size"
              value={`${results.standardSize} mm²`}
              highlight
              subtext={`Next standard size above calculated minimum of ${fmt(results.calcArea)} mm²`}
            />
            <ResultCard label="Full load current" value={`${fmt(results.current, 1)} A`} />
            <ResultCard
              label="Actual voltage drop (selected size)"
              value={`${fmt(results.actualVdPct)}%`}
              highlight={results.actualVdPct <= parseFloat(maxVdPct)}
              subtext={
                results.actualVdPct <= parseFloat(maxVdPct)
                  ? `✓ Within the ${maxVdPct}% limit`
                  : `✗ Exceeds the ${maxVdPct}% limit — select next larger size`
              }
            />
            <ResultCard
              label="Calculated minimum area"
              value={`${fmt(results.calcArea)} mm²`}
              subtext="Voltage drop formula only — always cross-check thermal current rating"
            />
          </>
        )
      }
    />
  );
}
