"use client";

/**
 * Earthing Resistance Calculator — Single Rod (Dwight Formula)
 *
 * Dwight's formula for a single vertical ground rod:
 *   R = (ρ / 2πL) × [ln(4L/d) - 1]
 *
 * Where:
 *   ρ = soil resistivity (Ω·m)
 *   L = rod length (m)
 *   d = rod diameter (m) = 2 × radius
 *
 * Multiple rods in parallel (Sverak approximation):
 *   R_parallel ≈ R_single / n × (1 + k × R_single / (ρ × d_spacing))
 *   Simple conservative estimate: R_n ≈ R1/n × (1 + s) where s = spacing factor
 *
 * IEC 60364-5-54 / BS 7671 / BNBC requirements:
 *   General purpose: ≤ 10 Ω
 *   IT systems / data centres: ≤ 1 Ω
 *   Lightning protection: ≤ 10 Ω (IEC 62305)
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

interface Results {
  resistance: number;
  resistanceParallel: number | null;
  meetsGeneral: boolean;
  meetsLightning: boolean;
  meetsIT: boolean;
}

const SOIL_TYPES = [
  { label: "Custom — enter value", value: "custom" },
  { label: "Wet organic soil / clay (15 Ω·m)", value: "15" },
  { label: "Moist clay / loam (50 Ω·m)", value: "50" },
  { label: "Typical Bangladesh alluvial (80 Ω·m)", value: "80" },
  { label: "Sandy loam (200 Ω·m)", value: "200" },
  { label: "Dry sandy soil (500 Ω·m)", value: "500" },
  { label: "Gravel / rocky (2000 Ω·m)", value: "2000" },
];

const ROD_DIAMETERS = [
  { label: "16 mm copper-bonded (standard)", value: "0.016" },
  { label: "20 mm copper-bonded", value: "0.020" },
  { label: "25 mm stainless steel", value: "0.025" },
  { label: "Custom", value: "custom" },
];

export function EarthingResistanceCalculator() {
  const [soilMode, setSoilMode] = useState("80");
  const [customSoil, setCustomSoil] = useState("");
  const [rodLength, setRodLength] = useState("3");
  const [diamMode, setDiamMode] = useState("0.016");
  const [customDiam, setCustomDiam] = useState("");
  const [numRods, setNumRods] = useState("1");
  const [results, setResults] = useState<Results | null>(null);

  const calculate = () => {
    const rho = parseFloat(soilMode === "custom" ? customSoil : soilMode) || 0;
    const L = parseFloat(rodLength) || 0;
    const d = parseFloat(diamMode === "custom" ? customDiam : diamMode) || 0;
    const n = parseInt(numRods) || 1;

    if (rho <= 0 || L <= 0 || d <= 0) return;

    // Dwight's formula: R = (ρ / 2πL) × [ln(4L/d) - 1]
    const R = (rho / (2 * Math.PI * L)) * (Math.log((4 * L) / d) - 1);

    // Multiple rods parallel (simple approximation: R/n for widely spaced rods)
    // Add ~10% coupling factor per Schwarz formula for practical spacing (≥2×L apart)
    const couplingFactor = n > 1 ? 0.1 : 0;
    const Rn = n > 1 ? (R / n) * (1 + couplingFactor * (n - 1)) : null;

    setResults({
      resistance: R,
      resistanceParallel: Rn,
      meetsGeneral: (Rn ?? R) <= 10,
      meetsLightning: (Rn ?? R) <= 10,
      meetsIT: (Rn ?? R) <= 1,
    });
  };

  const reset = () => setResults(null);

  const fmt = (n: number) => n.toFixed(2);

  const badge = (pass: boolean) =>
    pass ? (
      <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
        ✓ PASS
      </span>
    ) : (
      <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
        ✗ FAIL
      </span>
    );

  return (
    <CalculatorShell
      title="Earthing Resistance — Single Rod"
      description="Calculate the ground resistance of a single vertical rod using Dwight's formula. Used for LPS earthing design and general electrical earthing verification per IEC 62305 and BNBC."
      hasResults={results !== null}
      onReset={reset}
      inputs={
        <>
          <InputGroup
            label="Soil resistivity (ρ)"
            hint="Use a measured value from a soil test for accuracy."
          >
            <SelectInput
              options={SOIL_TYPES}
              value={soilMode}
              onChange={(e) => setSoilMode(e.target.value)}
            />
            {soilMode === "custom" && (
              <NumberInput
                className="mt-2"
                value={customSoil}
                onChange={(e) => setCustomSoil(e.target.value)}
                placeholder="Enter measured value"
                min="1"
                step="10"
                unit="Ω·m"
              />
            )}
          </InputGroup>

          <InputGroup label="Rod length" hint="Common values: 1.5 m, 2.4 m, 3 m.">
            <NumberInput
              value={rodLength}
              onChange={(e) => setRodLength(e.target.value)}
              min="0.5"
              max="20"
              step="0.5"
              unit="m"
            />
          </InputGroup>

          <InputGroup label="Rod diameter">
            <SelectInput
              options={ROD_DIAMETERS}
              value={diamMode}
              onChange={(e) => setDiamMode(e.target.value)}
            />
            {diamMode === "custom" && (
              <NumberInput
                className="mt-2"
                value={customDiam}
                onChange={(e) => setCustomDiam(e.target.value)}
                placeholder="Diameter in metres, e.g. 0.016"
                min="0.005"
                step="0.001"
                unit="m"
              />
            )}
          </InputGroup>

          <InputGroup
            label="Number of rods in parallel"
            hint="Rods should be spaced ≥ 2× rod length apart for this formula to apply."
          >
            <NumberInput
              value={numRods}
              onChange={(e) => setNumRods(e.target.value)}
              min="1"
              max="20"
              step="1"
              unit="rods"
            />
          </InputGroup>

          <CalcButton onClick={calculate} />
        </>
      }
      results={
        results && (
          <>
            <ResultCard
              label="Single rod resistance"
              value={`${fmt(results.resistance)} Ω`}
              highlight
              subtext="Dwight's formula: R = (ρ/2πL) × [ln(4L/d) − 1]"
            />
            {results.resistanceParallel !== null && (
              <ResultCard
                label="Parallel resistance (multiple rods)"
                value={`${fmt(results.resistanceParallel)} Ω`}
                highlight
                subtext="Approximate, includes 10% coupling factor"
              />
            )}
            <div className="border-border rounded-xl border p-5">
              <p className="text-text-soft mb-3 text-xs font-medium tracking-widest uppercase">
                Compliance check
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  General purpose ≤ 10 Ω (IEC 60364)
                  {badge(results.meetsGeneral)}
                </li>
                <li className="flex items-center">
                  Lightning protection ≤ 10 Ω (IEC 62305)
                  {badge(results.meetsLightning)}
                </li>
                <li className="flex items-center">
                  IT / data centre ≤ 1 Ω{badge(results.meetsIT)}
                </li>
              </ul>
            </div>
          </>
        )
      }
    />
  );
}
