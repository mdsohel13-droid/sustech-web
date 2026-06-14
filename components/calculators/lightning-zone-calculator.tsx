"use client";

/**
 * Lightning Protection Zone Calculator — IEC 62305 Rolling Sphere Method
 *
 * The Rolling Sphere Method (IEC 62305-3) uses an imaginary sphere rolled
 * over and around the structure. The sphere radius depends on the protection
 * level (LPL). Any point the sphere can touch is considered unprotected.
 *
 * Rolling sphere radii:
 *   LPL I   → R = 20 m   (highest protection, >98% interception efficiency)
 *   LPL II  → R = 30 m
 *   LPL III → R = 45 m
 *   LPL IV  → R = 60 m   (lowest protection)
 *
 * Protection radius at height h on a structure of height H:
 *   At the tip of a finial/rod at height h:
 *     r_p = √[R² - (R - h)²] = √(2Rh - h²)   [where h ≤ R]
 *
 * Zone of protection for a vertical air termination rod of height h_rod
 * on top of a structure of height H_str:
 *   Total height above ground: h_total = H_str + h_rod
 *   Protection radius at ground level: r = √(2R·h_total - h_total²)
 *   For structures shorter than R, the protected area at ground = r
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

const LPL_OPTIONS = [
  { label: "LPL I — R = 20 m (Chemical, munitions, hospitals)", value: "20" },
  { label: "LPL II — R = 30 m (Industrial, commercial, high-rise)", value: "30" },
  { label: "LPL III — R = 45 m (General buildings)", value: "45" },
  { label: "LPL IV — R = 60 m (Agricultural, low risk)", value: "60" },
];

interface Results {
  R: number;
  lplLabel: string;
  hTotal: number;
  protectionRadius: number;
  protectedAreaM2: number;
  interceptEfficiency: string;
}

export function LightningZoneCalculator() {
  const [lpl, setLpl] = useState("30");
  const [structureHeight, setStructureHeight] = useState("20");
  const [rodHeight, setRodHeight] = useState("1.5");
  const [results, setResults] = useState<Results | null>(null);

  const calculate = () => {
    const R = parseFloat(lpl) || 0;
    const H_str = parseFloat(structureHeight) || 0;
    const h_rod = parseFloat(rodHeight) || 0;
    const h_total = H_str + h_rod;

    if (R <= 0 || h_total <= 0) return;

    // Protection radius at ground level (rolling sphere at height h_total)
    // r = sqrt(2Rh - h²) only valid when h ≤ R
    const h_eff = Math.min(h_total, R); // sphere can't protect beyond its own radius
    const r = Math.sqrt(2 * R * h_eff - h_eff * h_eff);
    const area = Math.PI * r * r;

    const lplLabel = LPL_OPTIONS.find((o) => o.value === lpl)?.label ?? "";
    const efficiency = R === 20 ? ">98%" : R === 30 ? ">95%" : R === 45 ? ">90%" : ">80%";

    setResults({
      R,
      lplLabel,
      hTotal: h_total,
      protectionRadius: r,
      protectedAreaM2: area,
      interceptEfficiency: efficiency,
    });
  };

  const reset = () => setResults(null);
  const fmt = (n: number, d = 1) => n.toFixed(d);

  return (
    <CalculatorShell
      title="Lightning Protection Zone — Rolling Sphere (IEC 62305)"
      description="Determine the protection radius of an air termination (finial or rod) using the IEC 62305 Rolling Sphere Method. Used for LPS design to verify coverage of rooftop equipment, antennas, and building edges."
      hasResults={results !== null}
      onReset={reset}
      inputs={
        <>
          <InputGroup
            label="Lightning Protection Level (LPL)"
            hint="Select based on structure risk category per IEC 62305-2 risk assessment."
          >
            <SelectInput
              options={LPL_OPTIONS}
              value={lpl}
              onChange={(e) => setLpl(e.target.value)}
            />
          </InputGroup>

          <InputGroup
            label="Structure / building height"
            hint="Height of the building to be protected."
          >
            <NumberInput
              value={structureHeight}
              onChange={(e) => setStructureHeight(e.target.value)}
              min="0"
              max="500"
              step="0.5"
              unit="m"
            />
          </InputGroup>

          <InputGroup
            label="Air termination rod height"
            hint="Height of the finial/rod above the roof. Typical: 0.3 m – 3 m."
          >
            <NumberInput
              value={rodHeight}
              onChange={(e) => setRodHeight(e.target.value)}
              min="0"
              max="20"
              step="0.1"
              unit="m"
            />
          </InputGroup>

          <CalcButton onClick={calculate} />
        </>
      }
      results={
        results && (
          <>
            <ResultCard
              label="Protection radius at ground level"
              value={`${fmt(results.protectionRadius)} m`}
              highlight
              subtext="Horizontal radius from the base of the air termination"
            />
            <ResultCard
              label="Protected area (circular)"
              value={`${fmt(results.protectedAreaM2, 0)} m²`}
              subtext={`≈ ${fmt(results.protectedAreaM2 / 10000, 4)} ha`}
            />
            <ResultCard
              label="Rolling sphere radius (R)"
              value={`${results.R} m`}
              subtext={results.lplLabel}
            />
            <ResultCard
              label="Total air termination height"
              value={`${fmt(results.hTotal)} m AGL`}
              subtext="Above ground level (structure + rod)"
            />
            <ResultCard
              label="Interception efficiency"
              value={results.interceptEfficiency}
              subtext="Lightning flash interception probability for this LPL"
            />
            <div className="border-border rounded-xl border p-4 text-sm">
              <p className="text-ink-800 font-semibold">Design note</p>
              <p className="text-text-soft mt-1 text-xs">
                For complete roof coverage, mesh conductors or multiple air terminations are needed.
                All metal structures on the roof ≥ 0.2 m above the protected zone must be connected
                to the LPS. Verify down-conductors and earth termination separately.
              </p>
            </div>
          </>
        )
      }
    />
  );
}
