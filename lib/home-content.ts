/**
 * Homepage content — verbatim from content/homepage-copy.md (do not paraphrase).
 *
 * `value: null` fields are ERP-sourced `{{...}}` slots (via Hermes). They render as
 * honest "pending" states, never invented numbers (CLAUDE.md §6).
 */

import { primaryCta } from "@/lib/navigation";

export type ServiceIconKey = "solar" | "electrical" | "grounding" | "smart";
export type SectorIconKey = "manufacturing" | "power" | "commercial" | "ports";

export interface ProofStat {
  /** Matches the ERP field name in the copy file. */
  id: string;
  /** TODO: source the real figure from the ERP via Hermes before launch. */
  value: number | null;
  label: string;
}

export const hero = {
  eyebrow: "EPC ENGINEERING · SINCE 2017",
  title: "Single-point EPC for industrial power, solar and safety.",
  subhead:
    "Sustech designs, builds and commissions solar plants, substations, lightning protection " +
    "and smart electrical systems for commercial and industrial clients — engineered to IEC, " +
    "BNBC and NFPA standards, and delivered by one accountable team.",
  primaryCta,
  secondaryCta: { label: "See Our Projects", href: "/projects" },
} as const;

export const proof = {
  intro: "Proven across Bangladesh's industrial sector.",
  stats: [
    { id: "projects_delivered", value: null, label: "Projects delivered" },
    { id: "solar_capacity_kwp", value: null, label: "kWp solar installed" },
    { id: "substations_commissioned", value: null, label: "Substations commissioned" },
    { id: "years_operating", value: null, label: "Years in operation" },
    { id: "clients_served", value: null, label: "Industrial clients served" },
  ] satisfies ProofStat[],
} as const;

export const whatWeDo = {
  heading: "End-to-end engineering, under one roof.",
  lede: "Four capabilities that cover an industrial facility's power and safety from design to commissioning.",
  items: [
    {
      icon: "solar" as ServiceIconKey,
      title: "Solar & Energy",
      outcome:
        "Grid-tied, hybrid and rooftop solar, plus energy audits that cut your power bill and carbon.",
      href: "/services/solar-energy",
    },
    {
      icon: "electrical" as ServiceIconKey,
      title: "Electrical EPC",
      outcome:
        "Substations, panel boards and power distribution, engineered, built and commissioned to code.",
      href: "/services/electrical-epc",
    },
    {
      icon: "grounding" as ServiceIconKey,
      title: "Grounding & Lightning Protection",
      outcome:
        "IEC/NFPA-compliant earthing and lightning protection that safeguards people, plant and uptime.",
      href: "/services/grounding-lightning-protection",
    },
    {
      icon: "smart" as ServiceIconKey,
      title: "Smart Systems",
      outcome:
        "PLC automation, industrial lighting and intelligent controls that make your facility efficient and observable.",
      href: "/services/smart-systems",
    },
  ],
} as const;

export const solutions = {
  heading: "Built for your industry.",
  lede: "We engineer to the realities of your sector — its loads, standards, downtime costs and compliance.",
  items: [
    {
      icon: "manufacturing" as SectorIconKey,
      title: "Manufacturing & RMG / Textile",
      blurb: "Reliable power and safety for high-uptime production floors.",
      href: "/solutions/manufacturing-rmg-textile",
    },
    {
      icon: "power" as SectorIconKey,
      title: "Power & Utilities",
      blurb: "Substation and grid-side engineering built to utility standards.",
      href: "/solutions/power-utilities",
    },
    {
      icon: "commercial" as SectorIconKey,
      title: "Commercial Real Estate",
      blurb: "Efficient, compliant electrical and solar systems for commercial buildings.",
      href: "/solutions/commercial-real-estate",
    },
    {
      icon: "ports" as SectorIconKey,
      title: "Ports & Heavy Industry",
      blurb: "Robust power, protection and automation for demanding environments.",
      href: "/solutions/ports-heavy-industry",
    },
  ],
} as const;

export const featuredProjects = {
  heading: "Engineering you can stand on.",
  lede: "A selection of recent industrial and commercial projects — scope, scale and outcome.",
  viewAll: { label: "View all projects", href: "/projects" },
} as const;

export interface Differentiator {
  title: string;
  body: string;
  /** ERP/MD-confirmed credential text; prefixed to the body when present. */
  credentialSlot?: { id: string; value: string | null };
}

export const whySustech = {
  heading: "What sets us apart.",
  items: [
    {
      title: "In-house engineering, not resale.",
      body: "Our own engineers design every system — so the solution fits your site, not a catalogue.",
    },
    {
      title: "Compliant by design.",
      body: "Every project is engineered to IEC, BNBC and NFPA standards, documented and verifiable.",
    },
    {
      title: "A safety-first culture.",
      body: "Protection of people and plant is engineered in, not bolted on.",
      credentialSlot: { id: "safety_credentials_confirm", value: null },
    },
    {
      title: "One accountable team.",
      body: "Single-point responsibility from design through procurement, construction and commissioning — no finger-pointing between vendors.",
    },
    {
      title: "Support that lasts.",
      body: "After-sales service and AMC keep your systems performing for their full design life.",
    },
  ] satisfies Differentiator[],
} as const;

export const howWeWork = {
  heading: "From brief to commissioning, in four clear stages.",
  steps: [
    { title: "Discover", body: "We assess your site, loads, constraints and goals." },
    {
      title: "Engineer",
      body: "We design to standard, with full documentation and a defensible BOQ.",
    },
    { title: "Deliver", body: "We procure quality components and build to specification." },
    {
      title: "Commission",
      body: "We test, certify and hand over a system that performs — then support it.",
    },
  ],
} as const;

export const logoWall = {
  heading: "Trusted by leading industrial and commercial clients.",
} as const;

export const toolsTeaser = {
  heading: "See the numbers before you commit.",
  body:
    "Estimate your solar capacity, savings and payback in minutes with our engineering " +
    "calculators — the same models our engineers use.",
  cta: { label: "Try SolarCalc Pro", href: "/tools/solarcalc-pro" },
} as const;

export const testimonials = {
  heading: "In our clients' words.",
} as const;

export const ctaBand = {
  heading: "Planning an industrial power, solar or safety project?",
  subhead: "Tell us what you're building. Our engineers will scope it with you — no obligation.",
  primaryCta,
  /** Used when site.contact.phone is null (no invented number). */
  contactFallback: { label: "Or contact us", href: "/contact" },
} as const;
