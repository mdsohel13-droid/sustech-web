"use client";

/**
 * BAESS — Free Solar Engineering Tools (External Reference)
 *
 * A curated list of free, external engineering tools relevant to solar
 * design, energy auditing, and feasibility analysis for Bangladesh.
 * Each tool opens in a new tab (external link), with a description
 * of what it's useful for.
 */

import { ExternalLink } from "lucide-react";
import { CalculatorShell } from "./calculator-shell";

interface ExternalTool {
  name: string;
  url: string;
  description: string;
  category: string;
}

const TOOLS: ExternalTool[] = [
  {
    name: "PVGIS (Photovoltaic Geographical Information System)",
    url: "https://re.jrc.ec.europa.eu/pvg_tools/en/",
    description:
      "EU science hub — free solar irradiance data and PV energy estimation for any location worldwide, including Bangladesh. Uses NASA POWER and SARAH climate databases.",
    category: "Solar Resource",
  },
  {
    name: "NASA POWER (Prediction of Worldwide Energy Resources)",
    url: "https://power.larc.nasa.gov/",
    description:
      "Long-term satellite-derived solar irradiance and meteorological data for any coordinate. The primary data source for Bangladesh solar yield estimates.",
    category: "Solar Resource",
  },
  {
    name: "Global Solar Atlas",
    url: "https://globalsolaratlas.info/",
    description:
      "World Bank / ESMAP interactive map of solar resource potential. Provides GHI, DNI, and PVOUT for any location in Bangladesh at high resolution.",
    category: "Solar Resource",
  },
  {
    name: "HelioScope (Folsom Labs)",
    url: "https://www.helioscope.com/",
    description:
      "Professional PV system design and simulation tool with Bangladesh weather data. Free tier available for academic and small commercial use.",
    category: "PV Design",
  },
  {
    name: "SAM (System Advisor Model — NREL)",
    url: "https://sam.nrel.gov/",
    description:
      "Free desktop tool from the US National Renewable Energy Lab for techno-economic analysis of solar, storage, and wind projects. Supports custom tariff inputs for Bangladesh LCOE analysis.",
    category: "Financial Analysis",
  },
  {
    name: "RETScreen (NRCan)",
    url: "https://www.nrcan.gc.ca/energy/retscreen/7465",
    description:
      "Free clean energy management software from Natural Resources Canada. Includes Bangladesh climate data and supports comprehensive feasibility, financial, and GHG analysis.",
    category: "Financial Analysis",
  },
  {
    name: "IEC 61724-1 — PV System Performance Monitoring (Overview)",
    url: "https://webstore.iec.ch/publication/65589",
    description:
      "International standard for PV system performance monitoring. Defines performance ratio (PR), yield, and capacity factor benchmarks. Free preview available.",
    category: "Standards",
  },
  {
    name: "BNBC 2020 (Bangladesh National Building Code)",
    url: "https://housingbd.com/bnbc/",
    description:
      "The governing building code for Bangladesh. Contains sections on electrical installations, lightning protection, and structural requirements for rooftop solar.",
    category: "Standards",
  },
  {
    name: "SREDA (Sustainable and Renewable Energy Development Authority)",
    url: "https://www.sreda.gov.bd/",
    description:
      "Government authority for renewable energy in Bangladesh. Publishes net metering guidelines, solar policy documents, and approved vendor lists.",
    category: "Policy & Regulation",
  },
  {
    name: "BPDB Tariff Rate Schedule",
    url: "https://www.bpdb.gov.bd/",
    description:
      "Bangladesh Power Development Board's latest tariff rates for commercial, industrial, and residential consumers. Essential for savings calculations.",
    category: "Policy & Regulation",
  },
  {
    name: "Sustech Knowledge Hub (You are here)",
    url: "/knowledge",
    description:
      "Return to the Sustech Knowledge Hub for more engineering guides, calculators, and downloadable resources.",
    category: "Reference",
  },
];

export function ExternalReferenceCalculator() {
  return (
    <CalculatorShell
      title="BAESS — Free Solar Engineering Tools"
      description="A curated reference of free, authoritative external tools, databases, and standards for solar engineering, feasibility analysis, and compliance in Bangladesh. Click any tool to open it in a new tab."
      hasResults={false}
      onReset={() => {}}
      inputs={
        <div className="text-text-soft text-sm">
          <p>
            These external resources complement Sustech&#39;s built-in calculators. They are
            maintained by their respective organisations and may require registration or a
            download for full access.
          </p>
          <p className="mt-2">
            Use the tools below for detailed design, independent verification, or regulatory
            reference.
          </p>
        </div>
      }
      results={
        <div className="space-y-3">
          {TOOLS.map((tool, i) => (
            <a
              key={i}
              href={tool.url}
              target={tool.url.startsWith("http") ? "_blank" : undefined}
              rel={tool.url.startsWith("http") ? "noopener noreferrer" : undefined}
              className="border-border bg-surface hover:border-brand/30 group flex items-start gap-3 rounded-xl border p-4 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-ink-900 text-sm font-semibold group-hover:text-brand transition-colors">
                    {tool.name}
                  </p>
                  {tool.url.startsWith("http") && (
                    <ExternalLink className="text-text-soft h-3 w-3 shrink-0" aria-hidden />
                  )}
                </div>
                <p className="text-text-soft mt-1 text-xs leading-relaxed">{tool.description}</p>
                <span className="mt-2 inline-block rounded bg-blue-50 px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase text-blue-700">
                  {tool.category}
                </span>
              </div>
            </a>
          ))}
        </div>
      }
    />
  );
}