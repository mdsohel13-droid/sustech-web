/**
 * Site navigation structure — mirrors INFORMATION-ARCHITECTURE.md §1.
 * Every href resolves to a real (current or planned) route — no `javascript:void(0)`.
 */

export interface NavLeaf {
  label: string;
  href: string;
  /** Short descriptor shown in the desktop mega-menu. */
  description?: string;
}

export interface NavGroup {
  label: string;
  /** Present when the item is a dropdown/mega-menu trigger. */
  children?: NavLeaf[];
  /** Present when the item is a direct link. */
  href?: string;
}

export const sectors: NavLeaf[] = [
  {
    label: "Manufacturing & RMG / Textile",
    href: "/solutions/manufacturing-rmg-textile",
    description: "Reliable power and safety for high-uptime production floors.",
  },
  {
    label: "Power & Utilities",
    href: "/solutions/power-utilities",
    description: "Substation and grid-side engineering built to utility standards.",
  },
  {
    label: "Commercial Real Estate",
    href: "/solutions/commercial-real-estate",
    description: "Efficient, compliant electrical and solar for commercial buildings.",
  },
  {
    label: "Ports & Heavy Industry",
    href: "/solutions/ports-heavy-industry",
    description: "Robust power, protection and automation for demanding environments.",
  },
];

export const services: NavLeaf[] = [
  {
    label: "Solar & Energy",
    href: "/services/solar-energy",
    description: "Grid-tied, hybrid and rooftop solar, plus energy audits.",
  },
  {
    label: "Electrical EPC",
    href: "/services/electrical-epc",
    description: "Substations, panel boards and power distribution, built to code.",
  },
  {
    label: "Grounding & Lightning Protection",
    href: "/services/grounding-lightning-protection",
    description: "IEC/NFPA-compliant earthing and lightning protection.",
  },
  {
    label: "Smart Systems",
    href: "/services/smart-systems",
    description: "PLC automation, industrial lighting and intelligent controls.",
  },
];

export const mainNav: NavGroup[] = [
  { label: "Solutions", children: sectors },
  { label: "Services", children: services },
  { label: "Projects", href: "/projects" },
  { label: "Capabilities", href: "/capabilities" },
  { label: "Knowledge", href: "/knowledge" },
  { label: "About", href: "/about" },
];

/** The single conversion primitive — Request a Quote / Consultation (RFQ). */
export const primaryCta = {
  label: "Request a Consultation",
  href: "/request-quote",
} as const;
