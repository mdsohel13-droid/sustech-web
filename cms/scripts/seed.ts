import "./load-env";
import path from "node:path";
import { getPayload } from "payload";
import config from "../../payload.config";

/* Minimal Lexical builders so we can author rich text in the seed. */
const txt = (text: string, bold = false) => ({
  type: "text",
  text,
  format: bold ? 1 : 0,
  detail: 0,
  mode: "normal",
  style: "",
  version: 1,
});
const para = (...children: unknown[]) => ({
  type: "paragraph",
  children,
  direction: "ltr",
  format: "",
  indent: 0,
  version: 1,
  textFormat: 0,
});
const heading = (tag: "h2" | "h3", text: string) => ({
  type: "heading",
  tag,
  children: [txt(text)],
  direction: "ltr",
  format: "",
  indent: 0,
  version: 1,
});
const doc = (...children: unknown[]) => ({
  root: { type: "root", children, direction: "ltr", format: "", indent: 0, version: 1 },
});

const SERVICES = [
  {
    slug: "solar-renewable",
    title: "Solar & Renewable Energy",
    icon: "solar" as const,
    order: 1,
    summary:
      "On-grid, off-grid and hybrid solar EPC from 1 kWp to utility scale — design, supply, install and commission.",
  },
  {
    slug: "bess-storage",
    title: "BESS & Energy Storage",
    icon: "bess" as const,
    order: 2,
    summary:
      "Lithium (LFP) battery energy storage from 100 kWh to 1 MWh — load-shifting, backup, peak-shaving and microgrids.",
  },
  {
    slug: "lps-earthing",
    title: "Lightning Protection & Earthing",
    icon: "lps" as const,
    order: 3,
    summary:
      "IEC 62305 / NFPA 780 lightning protection, earthing design, installation and re-testing that protect people and plant.",
  },
  {
    slug: "electrical-epc",
    title: "Electrical & EPC Works",
    icon: "electrical" as const,
    order: 4,
    summary:
      "Full MEP and electrical EPC — factory wiring, panels, switchgear and distribution, engineered and built to code.",
  },
  {
    slug: "inspection-testing",
    title: "Inspection, Testing & Thermography",
    icon: "inspection" as const,
    order: 5,
    summary:
      "IR thermography, insulation and earth-resistance testing, DIFE inspection and third-party audit support.",
  },
  {
    slug: "substation-hv",
    title: "Substation & HV Works",
    icon: "substation" as const,
    order: 6,
    summary:
      "Substation design, construction and renovation; transformer testing, oil centrifuging, VCB and HT cable works.",
  },
  {
    slug: "fire-safety",
    title: "Fire & Safety Systems",
    icon: "fire" as const,
    order: 7,
    summary:
      "Fire detection and alarm systems, safety compliance and commissioning for industrial facilities.",
  },
  {
    slug: "lighting-distribution",
    title: "Lighting & Product Supply",
    icon: "lighting" as const,
    order: 8,
    summary:
      "Energy-efficient industrial lighting and the supply of solar, BLDC fans, LED and electrical products.",
  },
  {
    slug: "training-safety",
    title: "OH&S Training",
    icon: "training" as const,
    order: 9,
    summary:
      "Bureau Veritas channel-partner occupational health & safety, electrical safety and LOTO training.",
  },
  {
    slug: "consultancy",
    title: "Consultancy & Compliance",
    icon: "consultancy" as const,
    order: 10,
    summary:
      "Energy audits (SREDA), compliance consultancy, e-GP tender support and engineering advisory.",
  },
];

const SECTORS = [
  {
    slug: "garments-rmg",
    title: "Garments & RMG",
    icon: "garments" as const,
    order: 1,
    summary:
      "Reliable power, safety and compliance for high-uptime garments and textile production.",
  },
  {
    slug: "government",
    title: "Government & Public Sector",
    icon: "government" as const,
    order: 2,
    summary:
      "PWD-empanelled, e-GP-registered engineering for government and public-sector projects.",
  },
  {
    slug: "ngo-un",
    title: "NGO & UN Agencies",
    icon: "ngo" as const,
    order: 3,
    summary:
      "UN-grade reliability for humanitarian and development facilities, including off-grid sites.",
  },
  {
    slug: "industrial-chemical",
    title: "Industrial & Chemical",
    icon: "industrial" as const,
    order: 4,
    summary:
      "Robust electrical, substation and safety engineering for industrial and chemical plants.",
  },
  {
    slug: "ports-logistics",
    title: "Ports & Logistics",
    icon: "ports" as const,
    order: 5,
    summary: "Power, protection and automation for ports, terminals and logistics infrastructure.",
  },
  {
    slug: "healthcare",
    title: "Healthcare",
    icon: "healthcare" as const,
    order: 6,
    summary:
      "Compliant, resilient power and safety systems for hospitals and healthcare facilities.",
  },
  {
    slug: "academic",
    title: "Academic & TVET",
    icon: "academic" as const,
    order: 7,
    summary:
      "Solar, electrical and safety engineering for universities, schools and TVET institutions.",
  },
  {
    slug: "food-processing",
    title: "Food Processing",
    icon: "food" as const,
    order: 8,
    summary: "Hygienic, reliable power and controls for food processing and cold-chain facilities.",
  },
  {
    slug: "commercial",
    title: "Commercial & Hospitality",
    icon: "commercial" as const,
    order: 9,
    summary:
      "Efficient electrical, solar and smart systems for commercial buildings and hospitality.",
  },
  {
    slug: "heritage",
    title: "Heritage & Cultural",
    icon: "heritage" as const,
    order: 10,
    summary: "Sensitive, low-intrusion engineering for heritage sites and cultural institutions.",
  },
];

// Service detail content (Brief Part 7) — factual scope + real standards. Editable in the CMS.
const sd = (
  scopeText: string[],
  standardsText: string,
  faq: { question: string; answer: string }[],
) => ({
  scope: doc(...scopeText.map((t) => para(txt(t)))),
  standards: doc(para(txt(standardsText))),
  faq,
});
const SERVICE_DETAIL: Record<
  string,
  { scope: unknown; standards: unknown; faq: { question: string; answer: string }[] }
> = {
  "solar-renewable": sd(
    [
      "On-grid, off-grid and hybrid solar EPC from 1 kWp to utility scale — site assessment, system design, supply of quality components (Growatt inverters, JA Solar and Jinko Tiger-Neo N-type panels), installation, testing, grid-tie commissioning and performance monitoring.",
      "Reference projects include WFP Bhashanchar, the Commonwealth War Graves Commission in Chittagong, Eastport Cumilla (100 kWp) and CUET.",
    ],
    "PV systems are engineered to IEC 61215 / 61730 (modules), IEC 62548 (array design) and IEC 60364-7-712 (PV installations), in line with BNBC and DESCO/BPDB net-metering requirements.",
    [
      {
        question: "How long does a 50 kWp system take?",
        answer:
          "Typically a few weeks from design to commissioning, depending on site readiness and net-metering approval.",
      },
      {
        question: "What is the ROI on solar in Bangladesh?",
        answer:
          "Most industrial rooftop systems pay back within a few years through grid-electricity savings — we provide a feasibility report with your numbers.",
      },
      {
        question: "Do you handle DESCO/BPDB net-metering?",
        answer:
          "Yes — our scope covers design, documentation and coordination through to net-metering and grid-tie commissioning.",
      },
    ],
  ),
  "bess-storage": sd(
    [
      "Lithium (LFP) battery energy storage from 100 kWh to 1 MWh industrial cabinets, plus Hero2 UPS — for load-shifting, backup, peak-shaving and microgrid stabilisation. Sustech is the Bangladesh agent for Hithium LFP storage.",
      "Reference: WFP Bhashanchar 16 kWh BESS and the CWGC hybrid system.",
    ],
    "BESS uses LFP chemistry for safety and cycle life, integrated to IEC electrical-installation standards.",
    [
      {
        question: "LFP vs lead-acid — which is better?",
        answer:
          "LFP offers far longer cycle life, higher usable depth-of-discharge and a smaller footprint — a better total cost for industrial use.",
      },
      {
        question: "What sizes do you supply?",
        answer: "From 100 kWh to 1 MWh cabinets, sized to your load profile and backup goals.",
      },
    ],
  ),
  "lps-earthing": sd(
    [
      "Risk assessment, lightning-protection-system (LPS) and earthing design, installation of air termination, down-conductors and earth electrodes, surge protection, soil-resistivity (Wenner method) and earth-resistance re-testing with documentation. 40+ LPS/earthing jobs delivered.",
    ],
    "Engineered to IEC 62305, NFPA 780 and BS EN 62305; testing with calibrated KYORITSU / FLUKE earth-resistance testers.",
    [
      {
        question: "Why does sub-1 ohm earth resistance matter?",
        answer:
          "Low earth resistance lets fault and lightning currents dissipate safely, protecting people and equipment.",
      },
      {
        question: "Do you re-test existing earthing?",
        answer:
          "Yes — we measure soil resistivity and earth resistance and provide a documented report with remediation.",
      },
    ],
  ),
  "electrical-epc": sd(
    [
      "Full MEP design and execution (LEED v4 capability) — factory wiring, cable laying, panel boards, switchgear and IP65 panels — from design to commissioning.",
      "Reference: Vanguard Dress turnkey, Pacific Group and Independence Apparels.",
    ],
    "Installations follow IEC 60364 (low-voltage), IEC 61439 (switchgear assemblies) and IEC 60076 (transformers), the Bangladesh Electricity Rules and BNBC.",
    [
      {
        question: "Do you do turnkey factory wiring?",
        answer:
          "Yes — from first conduit to final lux reading, including substation and rooftop solar where needed.",
      },
      {
        question: "Can you work to our existing drawings?",
        answer: "Yes; we review, validate and engineer to standard, or design from scratch.",
      },
    ],
  ),
  "inspection-testing": sd(
    [
      "IR thermography for predictive maintenance, insulation-resistance (Megger) and earth-resistance testing, DIFE annual inspection and third-party audit support (British Embassy reference). Equipment: FLIR thermal camera, Megger, TESTO and KYORITSU.",
    ],
    "Verification and testing follow IEC 60364-6 and recognised IEC / IEEE methods, with DIFE and ACCORD/RSC compliance.",
    [
      {
        question: "What does thermography find?",
        answer:
          "Loose connections, overloaded circuits and failing components — before they cause downtime or fire.",
      },
      {
        question: "How often should we test?",
        answer: "Annually for most facilities, or as your DIFE / insurer requirements specify.",
      },
    ],
  ),
  "substation-hv": sd(
    [
      "Substation design, construction and renovation; transformer testing and oil centrifuging (CPC 100), VCB repair, ATS installation, and HT cable testing and replacement.",
      "Reference: United Group Dhaka (1600 + 2000 kVA), WFP Bhashanchar (250 + 200 kVA) and Container Terminal Chittagong.",
    ],
    "Engineered to IEC 60076 (transformers), IEC 61439 (assemblies) and IEC 60364, the Bangladesh Electricity Rules and BNBC.",
    [
      {
        question: "Do you service live transformers?",
        answer:
          "We plan outages and carry out testing, oil centrifuging and servicing to extend transformer life safely.",
      },
    ],
  ),
  "fire-safety": sd(
    [
      "Fire detection and alarm system design, supply, installation and commissioning, plus electrical fire-safety compliance for industrial facilities.",
    ],
    "Engineered to NFPA and BNBC fire-safety provisions.",
    [
      {
        question: "Do you commission and hand over?",
        answer: "Yes — design, install, commission and hand over with full documentation.",
      },
    ],
  ),
  "lighting-distribution": sd(
    [
      "Energy-efficient industrial and high-bay LED lighting and solar street lighting, plus supply and distribution of solar components, BLDC fans (Atomberg) and electrical products.",
    ],
    "Lighting designed to required lux levels and energy-efficiency best practice.",
    [
      {
        question: "Are you an Atomberg distributor?",
        answer: "Yes — Sustech is the sole distributor of Atomberg BLDC fans in Bangladesh.",
      },
    ],
  ),
  "training-safety": sd(
    [
      "Occupational health & safety, electrical safety and LOTO training, delivered as a Bureau Veritas channel partner.",
    ],
    "Training aligned to OH&S best practice and Bureau Veritas curricula.",
    [
      {
        question: "Who is the training for?",
        answer: "Industrial and factory teams needing electrical-safety, LOTO and OH&S competency.",
      },
    ],
  ),
  consultancy: sd(
    [
      "SREDA energy audits, compliance consultancy, e-GP government-tender support and engineering advisory — helping facilities plan, comply and procure.",
    ],
    "Audits and advisory aligned to SREDA, DIFE and relevant IEC / BNBC standards.",
    [
      {
        question: "Do you carry out SREDA energy audits?",
        answer: "Yes — our Managing Director is a SREDA-certified Energy Auditor.",
      },
    ],
  ),
};

const cd = (challengesText: string, serviceSlugs: string[]) => ({
  challenges: doc(para(txt(challengesText))),
  serviceSlugs,
});
const SECTOR_DETAIL: Record<string, { challenges: unknown; serviceSlugs: string[] }> = {
  "garments-rmg": cd(
    "Garments and RMG floors run on uptime and must pass ACCORD/RSC and DIFE electrical-safety audits — reliable power, compliant wiring and documented safety are non-negotiable.",
    ["electrical-epc", "solar-renewable", "lps-earthing", "inspection-testing", "fire-safety"],
  ),
  government: cd(
    "Government and public-sector projects demand PWD-empanelled, e-GP-compliant engineering with defensible documentation and tender compliance.",
    ["electrical-epc", "solar-renewable", "substation-hv", "consultancy"],
  ),
  "ngo-un": cd(
    "Humanitarian and development sites — often off-grid or remote — need UN-grade reliability from solar, storage and backup power.",
    ["solar-renewable", "bess-storage", "substation-hv", "electrical-epc"],
  ),
  "industrial-chemical": cd(
    "Industrial and chemical plants need robust distribution, protection and testing in demanding, sometimes hazardous environments.",
    ["electrical-epc", "substation-hv", "lps-earthing", "inspection-testing"],
  ),
  "ports-logistics": cd(
    "Ports, terminals and logistics infrastructure require resilient power, protection and automation for heavy, continuous operations.",
    ["substation-hv", "electrical-epc", "lps-earthing", "inspection-testing"],
  ),
  healthcare: cd(
    "Hospitals and healthcare facilities require resilient, compliant power and safety systems where downtime is not an option.",
    ["electrical-epc", "solar-renewable", "fire-safety", "inspection-testing"],
  ),
  academic: cd(
    "Universities, schools and TVET institutions invest in rooftop solar, efficient electrical systems and safety compliance.",
    ["solar-renewable", "electrical-epc", "lps-earthing", "training-safety"],
  ),
  "food-processing": cd(
    "Food processing and cold-chain facilities need hygienic, reliable power, controls and backup to protect product and uptime.",
    ["electrical-epc", "solar-renewable", "bess-storage", "inspection-testing"],
  ),
  commercial: cd(
    "Commercial buildings and hospitality balance running cost, occupant safety and code compliance — efficient electrical, solar and smart systems.",
    ["electrical-epc", "solar-renewable", "lighting-distribution", "fire-safety"],
  ),
  heritage: cd(
    "Heritage and cultural sites need sensitive, low-intrusion engineering — renewable energy and safety that respects irreplaceable structures.",
    ["solar-renewable", "bess-storage", "lps-earthing", "electrical-epc"],
  ),
};

// --- About content (Brief Parts 2–5) ---------------------------------------
const MISSION =
  "To engineer a smarter, cleaner and safer built environment across Bangladesh — delivering " +
  "energy-efficient, compliant and technology-forward solutions that help industries grow, " +
  "communities thrive and the nation lead the clean-energy transition.";

const VISION =
  "To become South Asia's most trusted integrated energy-engineering brand — manufacturing our own " +
  "products, powering microgrids and operating at scale across Bangladesh and beyond by 2032.";

const VALUES = [
  {
    title: "Integrity",
    body: "We never compromise on safety, compliance or honest advice.",
  },
  {
    title: "Excellence",
    body: "CUET-trained engineers, calibrated test equipment and international standards (IEC, NFPA, IEEE, BNBC).",
  },
  {
    title: "Innovation",
    body: "AI-powered proposals, IoT energy management and BESS technology — tomorrow's tools, today.",
  },
  {
    title: "Partnership",
    body: "We grow with our clients; 52 of our 175 relationships have become long-term accounts.",
  },
  {
    title: "Sustainability",
    body: "Every solar kWp we install reduces Bangladesh's carbon load. We mean it.",
  },
];

const cert = (name: string, detail: string) => para(txt(`${name} — `, true), txt(detail));
const CERTIFICATIONS = [
  cert("RJSC Registered", "Private Limited Company (CH-12343/2017)."),
  cert("TIN & VAT Registered", "Bangladesh NBR."),
  cert("PWD Empanelled", "Public Works Department."),
  cert("e-GP Registered", "Government eTendering platform."),
  cert("SREDA Certified", "Energy Auditor (MD personal certification)."),
  cert("BFSCD Certified", "Fire Safety Manager."),
  cert("Bureau Veritas Channel Partner", "OH&S training."),
  cert("Chittagong Chamber of Commerce", "Member."),
  cert("ISO 9001", "In progress."),
  cert("Standards compliance", "IEC · IEEE · NFPA · BNBC · NEC · ACCORD/RSC."),
];

const PARTNERSHIPS = [
  cert("Atomberg Technologies", "Sole Distributor, Bangladesh (India)."),
  cert("Growatt New Energy", "Authorized Distributor (China)."),
  cert("Hithium Energy Storage", "Bangladesh Agent (China)."),
  cert("Jinko Solar", "Authorized Dealer (China)."),
  cert("JA Solar", "Authorized Dealer (China)."),
  cert("Bureau Veritas", "Channel Partner — training (France)."),
  cert("Fairmate", "Sole Distributor, Chittagong (BD/India)."),
  cert("IE Energy", "Bangladesh Agent — BESS (China)."),
];

const ENGINEER_BIO = "Field execution, LPS/earthing design and MEP works.";
const TEAM = [
  {
    name: "Md. Sohel Sikder",
    role: "Managing Director & Founder",
    order: 1,
    bio:
      "CUET graduate, SREDA-certified Energy Auditor and Government-certified Fire Safety Manager. " +
      "Sohel founded Sustech on the conviction that Bangladesh's industrial sector deserved engineering " +
      "partners combining global standards with deep local expertise — leading strategy, key accounts, " +
      "EPC oversight and major technical proposals.",
  },
  {
    name: "Sadema Begum",
    role: "Chairman",
    order: 2,
    bio: "PWD-license signatory; board governance and statutory authorization for government projects.",
  },
  {
    name: "Md. Kaium Sikdar",
    role: "Director — Dhaka Liaison",
    order: 3,
    bio: "Based in Lalmatia, Dhaka — bridges Sustech to the Dhaka government and corporate market.",
  },
  {
    name: "Newton",
    role: "Lead Engineer — Solar & EPC",
    order: 4,
    bio: "CUET-network engineer leading solar PV system design, BOQ preparation and technical proposals.",
  },
  { name: "Omar", role: "Engineer", order: 5, bio: ENGINEER_BIO },
  { name: "Jahangir", role: "Engineer", order: 6, bio: ENGINEER_BIO },
  { name: "Md. Alim", role: "Mechanical Engineer", order: 7, bio: ENGINEER_BIO },
  { name: "Tasnim Ahmad", role: "Engineer", order: 8, bio: ENGINEER_BIO },
  { name: "Asib Ahmed", role: "Engineer", order: 9, bio: ENGINEER_BIO },
  { name: "Shuva", role: "Engineer", order: 10, bio: ENGINEER_BIO },
  { name: "RKD Rajib", role: "Engineer", order: 11, bio: ENGINEER_BIO },
];

// Brief Part 6 — named showcase projects (clients approved for display). Published.
interface FeaturedProject {
  name: string;
  sectorSlug: string;
  serviceSlugs: string[];
  summary: string;
  capacity?: string;
  location?: string;
  year?: number;
}
const FEATURED_PROJECTS: FeaturedProject[] = [
  {
    name: "WFP Bhashanchar Substation",
    sectorSlug: "ngo-un",
    serviceSlugs: ["substation-hv", "bess-storage", "electrical-epc"],
    summary:
      "250 kVA + 200 kVA substation, a 110 kW generator and a 16 kWh BESS for a UN humanitarian island facility — UN-grade reliability where the grid is the last resort.",
    capacity: "250 + 200 kVA · 110 kW gen · 16 kWh BESS",
    location: "Bhashanchar",
  },
  {
    name: "Commonwealth War Graves Commission — Chittagong Hybrid Solar",
    sectorSlug: "heritage",
    serviceSlugs: ["solar-renewable", "bess-storage"],
    summary:
      "A heritage-site hybrid solar system with zero visual intrusion, audited by the British Embassy — renewable energy meets irreplaceable history.",
    location: "Chittagong",
  },
  {
    name: "Eastport Cumilla — 100 kWp On-Grid Solar EPC",
    sectorSlug: "industrial-chemical",
    serviceSlugs: ["solar-renewable", "electrical-epc"],
    summary:
      "100 kWp on-grid solar EPC with Growatt inverters and JA Solar panels — full EPC from design to commissioning, from drawing to kWh.",
    capacity: "100 kWp",
    location: "Cumilla",
  },
  {
    name: "Syngenta Bangladesh — Multi-Line Account",
    sectorSlug: "industrial-chemical",
    serviceSlugs: ["substation-hv", "inspection-testing", "lps-earthing", "lighting-distribution"],
    summary:
      "Substation renovation, transformer testing, DIFE compliance, thermography and flood lighting — 18 jobs over five years for a long-term industrial account.",
    location: "Bangladesh",
  },
  {
    name: "Vanguard Dress / BSA Group — Turnkey Factory",
    sectorSlug: "garments-rmg",
    serviceSlugs: ["electrical-epc", "substation-hv", "solar-renewable"],
    summary:
      "Full factory wiring, a new substation and rooftop solar — delivered turnkey, complete from first conduit to final lux reading.",
  },
  {
    name: "CUET Rooftop Solar",
    sectorSlug: "academic",
    serviceSlugs: ["solar-renewable"],
    summary: "University rooftop solar for Sustech's oldest institutional client (since 2021).",
    location: "Chattogram",
    year: 2025,
  },
  {
    name: "WFP Cox's Bazar — Substation & Generator",
    sectorSlug: "ngo-un",
    serviceSlugs: ["substation-hv", "electrical-epc"],
    summary: "A substation and generator for a humanitarian deployment with challenging logistics.",
    location: "Cox's Bazar",
  },
  {
    name: "United Group HQ Dhaka — Transformer Servicing",
    sectorSlug: "commercial",
    serviceSlugs: ["substation-hv", "inspection-testing"],
    summary: "1600 kVA and 2000 kVA transformer oil centrifuging for a commercial HQ.",
    capacity: "1600 + 2000 kVA",
    location: "Dhaka",
  },
];

// Knowledge articles (Brief Part 8, Tier 1) — educational engineering content. Published.
const article = (
  title: string,
  publishedDate: string,
  excerpt: string,
  sections: [string, string][],
  faq: { question: string; answer: string }[],
) => ({
  title,
  slug: title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, ""),
  author: "Sustech Engineering Team",
  publishedDate,
  excerpt,
  body: doc(...sections.flatMap(([h, b]) => [heading("h2", h), para(txt(b))])),
  faq,
  _status: "published" as const,
});

const ARTICLES = [
  article(
    "How to Size a Solar System for a Garments Factory in Bangladesh",
    "2026-05-04",
    "A practical guide to sizing rooftop solar for a Bangladeshi garments factory — load assessment, roof area, grid tie-in and payback.",
    [
      [
        "Start with your load profile",
        "Sizing begins with how much electricity you use and when. Pull 12 months of utility bills, identify your daytime base load (machines, lighting, HVAC) and your peak demand. Rooftop solar offsets daytime consumption, so the daytime load — not the monthly total — sets the useful system size.",
      ],
      [
        "Roof area and capacity",
        "As a rule of thumb, each kWp of modern mono-PERC or N-type panels needs roughly 5–7 m² of usable, shade-free roof. A typical RMG shed roof can host hundreds of kWp. We assess structural capacity, orientation and shading before fixing the array layout.",
      ],
      [
        "Grid tie-in and net-metering",
        "On-grid systems in Bangladesh connect under DESCO/BPDB net-metering, which credits exported energy. Our scope covers single-line design, protection, documentation and coordination through to net-metering approval and grid-tie commissioning.",
      ],
      [
        "Estimating payback",
        "Payback depends on your tariff, daytime self-consumption and system cost. Most industrial rooftop systems in Bangladesh recover their cost within a few years and then deliver decades of low-cost generation. We provide a feasibility report with your actual numbers.",
      ],
    ],
    [
      {
        question: "How big a system can my factory roof take?",
        answer:
          "Most garments sheds can host hundreds of kWp; we confirm the exact figure from a structural and shading survey of your roof.",
      },
      {
        question: "Do you handle net-metering with DESCO/BPDB?",
        answer: "Yes — design, documentation and coordination through to net-metering approval.",
      },
    ],
  ),
  article(
    "DIFE Electrical Inspection Checklist 2026 — What Bangladesh Factories Must Know",
    "2026-05-11",
    "What DIFE electrical inspectors look for, the common findings, and how to prepare your factory to pass.",
    [
      [
        "What DIFE checks",
        "The Department of Inspection for Factories and Establishments (DIFE) assesses electrical safety as part of its compliance regime: distribution boards, earthing and bonding, cable condition and loading, protection settings, and documentation. Inspectors look for hazards that put workers and continuity at risk.",
      ],
      [
        "Common findings",
        "Typical gaps include loose or overheated connections (often found on a thermographic scan), inadequate or untested earthing, overloaded circuits, missing or mis-rated protection, and incomplete single-line diagrams and test records.",
      ],
      [
        "How to prepare",
        "Carry out an electrical safety audit ahead of the inspection: thermography of boards and busbars, earth-resistance testing, a protection-coordination review, and an up-to-date single-line diagram with test certificates. Remediate findings before the inspector arrives.",
      ],
    ],
    [
      {
        question: "How often is DIFE inspection required?",
        answer:
          "Inspections are periodic and may be triggered by compliance programmes or incidents — an annual self-audit keeps you ready.",
      },
      {
        question: "Can Sustech prepare us for DIFE?",
        answer:
          "Yes — we audit, thermograph, test earthing and remediate findings, then document everything for the inspection.",
      },
    ],
  ),
  article(
    "IEC 62305 Lightning Protection System Design — A Bangladesh Guide",
    "2026-05-18",
    "How a standards-based lightning protection system is designed under IEC 62305 — risk assessment, protection levels and components.",
    [
      [
        "Start with a risk assessment",
        "IEC 62305 design begins with a risk assessment of the structure and its contents — location, dimensions, occupancy, services and the consequences of a strike. The assessment determines the required Lightning Protection Level (LPL I–IV) and whether protection is needed at all.",
      ],
      [
        "Air termination, down-conductors and earthing",
        "The system comprises an air-termination network (rods, meshes or catenaries sized by the rolling-sphere method), down-conductors that route the current safely to ground, and a low-impedance earth-termination system. Bonding and surge protection (SPDs) protect internal systems.",
      ],
      [
        "Soil resistivity and earthing",
        "Effective earthing depends on soil resistivity, which we measure with the Wenner four-pin method. Electrode design (rods, plates or rings) is then chosen to achieve a low, stable earth resistance suitable for the protection level.",
      ],
    ],
    [
      {
        question: "Which standards apply in Bangladesh?",
        answer:
          "We design to IEC 62305 and NFPA 780, with BS EN 62305 as the harmonised reference.",
      },
      {
        question: "Do I need a risk assessment first?",
        answer: "Yes — IEC 62305 design always starts from a structure-specific risk assessment.",
      },
    ],
  ),
  article(
    "Earth Resistance Testing: Why Sub-1 Ohm Matters for Your Factory",
    "2026-05-25",
    "What earth-resistance testing measures, why a low value matters, the method, and how often to test.",
    [
      [
        "Why earth resistance matters",
        "Your earthing system gives fault currents and lightning a safe path to ground. A high earth resistance means dangerous touch voltages, nuisance trips and poor protection. A low, stable earth resistance keeps people safe and equipment protected.",
      ],
      [
        "The Wenner method",
        "Soil resistivity is measured with the Wenner four-pin method, and earth resistance with calibrated KYORITSU or FLUKE testers using the fall-of-potential technique. Results are documented against the design target for the installation and protection level.",
      ],
      [
        "How often to test",
        "Earth resistance drifts with soil moisture, corrosion and changes on site. Test at commissioning and at least annually thereafter — and after any significant electrical works. We provide a documented report with remediation where values exceed target.",
      ],
    ],
    [
      {
        question: "What earth resistance should I target?",
        answer:
          "The target depends on the installation and protection level; many industrial earths aim for a low single-digit ohm value or better, verified by test.",
      },
      {
        question: "How often should earthing be re-tested?",
        answer: "At commissioning, annually, and after major electrical works.",
      },
    ],
  ),
  article(
    "Battery Energy Storage (BESS) for Industrial Bangladesh: LFP vs Lead-Acid",
    "2026-06-01",
    "A practical comparison of LFP and lead-acid storage for industrial Bangladesh — cycle life, footprint, safety and total cost.",
    [
      [
        "Why storage now",
        "Battery energy storage lets a factory shift solar into the evening, ride through outages, shave demand peaks and stabilise a microgrid. The technology choice — lithium iron phosphate (LFP) versus lead-acid — drives the cost and reliability of all of these.",
      ],
      [
        "LFP vs lead-acid",
        "LFP offers far longer cycle life, higher usable depth-of-discharge, a much smaller footprint and a flat, safe chemistry. Lead-acid is cheaper upfront but heavier, shorter-lived and limited in usable capacity — so its total cost per usable kWh over the system life is usually higher for industrial duty.",
      ],
      [
        "Sizing and use cases",
        "Sustech supplies LFP cabinets from 100 kWh to 1 MWh (Hithium agency) sized to your use case: load-shifting, backup, peak-shaving or microgrid stabilisation. We model your load and tariff to size storage that pays its way.",
      ],
    ],
    [
      {
        question: "Is LFP safe for an industrial site?",
        answer:
          "LFP is among the safest lithium chemistries — thermally stable with robust battery-management — and is well suited to industrial duty.",
      },
      {
        question: "What sizes do you supply?",
        answer: "From 100 kWh to 1 MWh cabinets, sized to your load and backup goals.",
      },
    ],
  ),
];

const customLink = (label: string, url: string, extra: Record<string, unknown> = {}) => ({
  label,
  type: "custom" as const,
  url,
  ...extra,
});

async function main(): Promise<void> {
  const payload = await getPayload({ config });

  // --- Users ---------------------------------------------------------------
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@sustech.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe!2026";
  const existingAdmins = await payload.count({ collection: "users" });
  if (existingAdmins.totalDocs === 0) {
    await payload.create({
      collection: "users",
      data: { email: adminEmail, password: adminPassword, name: "Site Admin", role: "admin" },
    });
    await payload.create({
      collection: "users",
      data: {
        email: process.env.SEED_HERMES_EMAIL ?? "hermes@sustech.local",
        password: process.env.SEED_HERMES_PASSWORD ?? "HermesDraft!2026",
        name: "Hermes (ERP service)",
        role: "hermes",
      },
    });
    payload.logger.info(`Created admin (${adminEmail}) and Hermes service account.`);
  }

  // --- Services & Sectors --------------------------------------------------
  for (const s of SERVICES) {
    const detail = SERVICE_DETAIL[s.slug] ?? {};
    const found = await payload.find({
      collection: "services",
      where: { slug: { equals: s.slug } },
      limit: 1,
    });
    if (found.docs.length === 0) {
      await payload.create({ collection: "services", data: { ...s, ...detail } });
    } else {
      // Backfill detail content (scope / standards / FAQ) without clobbering edits to core fields.
      await payload.update({ collection: "services", id: found.docs[0]!.id, data: detail });
    }
  }
  // Resolve service ids so sectors can reference their relevant services.
  const allServices = await payload.find({ collection: "services", limit: 50, depth: 0 });
  const serviceIdBySlug = new Map<string, number>(
    allServices.docs.map((d) => [d.slug, d.id as number]),
  );
  for (const s of SECTORS) {
    const detail = SECTOR_DETAIL[s.slug];
    const serviceIds = (detail?.serviceSlugs ?? [])
      .map((sl) => serviceIdBySlug.get(sl))
      .filter((id): id is number => typeof id === "number");
    const detailData = detail ? { challenges: detail.challenges, services: serviceIds } : {};
    const found = await payload.find({
      collection: "sectors",
      where: { slug: { equals: s.slug } },
      limit: 1,
    });
    if (found.docs.length === 0) {
      await payload.create({ collection: "sectors", data: { ...s, ...detailData } });
    } else {
      await payload.update({ collection: "sectors", id: found.docs[0]!.id, data: detailData });
    }
  }

  // Remove any services/sectors from the previous taxonomy (slugs no longer in use).
  const keepServiceSlugs = new Set(SERVICES.map((s) => s.slug));
  const allServiceDocs = await payload.find({ collection: "services", limit: 100, depth: 0 });
  for (const d of allServiceDocs.docs) {
    if (!keepServiceSlugs.has(d.slug)) {
      await payload.delete({ collection: "services", id: d.id });
    }
  }
  const keepSectorSlugs = new Set(SECTORS.map((s) => s.slug));
  const allSectorDocs = await payload.find({ collection: "sectors", limit: 100, depth: 0 });
  for (const d of allSectorDocs.docs) {
    if (!keepSectorSlugs.has(d.slug)) {
      await payload.delete({ collection: "sectors", id: d.id });
    }
  }

  // --- Featured projects (Brief Part 6) — published showcase work -----------
  const sectorIdBySlug = new Map<string, number>(
    allSectorDocs.docs
      .filter((d) => keepSectorSlugs.has(d.slug))
      .map((d) => [d.slug, d.id as number]),
  );
  for (const p of FEATURED_PROJECTS) {
    const sectorId = sectorIdBySlug.get(p.sectorSlug);
    const serviceIds = p.serviceSlugs
      .map((sl) => serviceIdBySlug.get(sl))
      .filter((id): id is number => typeof id === "number");
    const data = {
      name: p.name,
      summary: p.summary,
      sector: sectorId,
      services: serviceIds,
      location: p.location,
      capacity: p.capacity,
      year: p.year,
      featured: true,
      clientPublic: true,
      _status: "published" as const,
    };
    const found = await payload.find({
      collection: "projects",
      where: { name: { equals: p.name } },
      draft: true,
      limit: 1,
      overrideAccess: true,
    });
    if (found.docs.length === 0) {
      await payload.create({ collection: "projects", data });
    } else {
      await payload.update({ collection: "projects", id: found.docs[0]!.id, data });
    }
  }

  // --- Knowledge articles (Brief Part 8) -----------------------------------
  for (const a of ARTICLES) {
    const found = await payload.find({
      collection: "articles",
      where: { title: { equals: a.title } },
      draft: true,
      limit: 1,
      overrideAccess: true,
    });
    if (found.docs.length === 0) {
      await payload.create({ collection: "articles", data: a });
    } else {
      await payload.update({ collection: "articles", id: found.docs[0]!.id, data: a });
    }
  }

  // --- Brand logo (committed seed asset → CMS media → site-settings) -------
  const logoAlt = "Sustech Technology Ltd logo";
  const existingLogoMedia = await payload.find({
    collection: "media",
    where: { alt: { equals: logoAlt } },
    limit: 1,
  });
  const logoMediaId =
    existingLogoMedia.docs[0]?.id ??
    (
      await payload.create({
        collection: "media",
        data: { alt: logoAlt },
        filePath: path.resolve("cms/seed-assets/logo.png"),
      })
    ).id;

  // --- SiteSettings --------------------------------------------------------
  await payload.updateGlobal({
    slug: "site-settings",
    data: {
      logo: logoMediaId,
      companyName: "Sustech Technology Ltd",
      shortName: "Sustech",
      tagline: "Smart Energy. Strong Engineering. Sustainable Solution.",
      description:
        "Sustech Technology Ltd is a Chattogram-based integrated engineering and energy company, " +
        "founded in 2017 — delivering solar & renewable EPC, battery energy storage, electrical & " +
        "EPC works, lightning protection & earthing, substation & HV works, and inspection, testing " +
        "& compliance for industrial, government, NGO/UN and commercial clients across Bangladesh.",
      foundingYear: 2017,
      areaServed: "Bangladesh",
      phones: [{ number: "+880 1867 655 599" }, { number: "+880 1722 002 125" }],
      email: "info@sustechltd.com",
      address: {
        street: "House #98, Road #08, O.R. Nizam Road R/A, GEC, Nasirabad",
        city: "Chattogram",
        region: "Chattogram",
        postalCode: "4000",
        country: "BD",
      },
      geo: { latitude: 22.3709, longitude: 91.8317 },
      hours: "Sunday–Thursday 9:00 AM–6:00 PM (BST)",
      social: [{ label: "Facebook", url: "https://www.facebook.com/sustechltd" }],
      defaultTitle:
        "Sustech Technology Ltd — Solar EPC, BESS & Electrical Engineering in Chattogram, Bangladesh",
      titleTemplate: "%s · Sustech Technology Ltd",
      defaultDescription:
        "Integrated engineering & energy company in Chattogram, Bangladesh since 2017 — solar EPC, " +
        "BESS, substation/HV, lightning protection, electrical EPC and inspection & testing for " +
        "industrial, government and commercial clients.",
    },
  });

  // --- Navigation ----------------------------------------------------------
  await payload.updateGlobal({
    slug: "navigation",
    data: {
      header: [
        {
          label: "Solutions",
          type: "custom",
          url: "#",
          children: SECTORS.map((s) =>
            customLink(s.title, `/solutions/${s.slug}`, { description: s.summary }),
          ),
        },
        {
          label: "Services",
          type: "custom",
          url: "#",
          children: SERVICES.map((s) =>
            customLink(s.title, `/services/${s.slug}`, { description: s.summary }),
          ),
        },
        customLink("Projects", "/projects"),
        customLink("Capabilities", "/capabilities"),
        customLink("Knowledge", "/knowledge"),
        customLink("About", "/about"),
      ],
      headerCta: customLink("Request a Consultation", "/request-quote"),
      footerColumns: [
        {
          title: "Solutions",
          links: SECTORS.map((s) => customLink(s.title, `/solutions/${s.slug}`)),
        },
        {
          title: "Services",
          links: SERVICES.map((s) => customLink(s.title, `/services/${s.slug}`)),
        },
        {
          title: "Company",
          links: [
            customLink("Projects", "/projects"),
            customLink("Capabilities", "/capabilities"),
            customLink("Knowledge", "/knowledge"),
            customLink("About", "/about"),
            customLink("Contact", "/contact"),
          ],
        },
      ],
    },
  });

  // --- Hero media (committed seed asset → CMS media) -----------------------
  const heroAlt =
    "Sustech engineers installing rooftop solar on a factory roof in Chittagong, Bangladesh";
  const existingHeroMedia = await payload.find({
    collection: "media",
    where: { alt: { equals: heroAlt } },
    limit: 1,
  });
  const heroMediaId =
    existingHeroMedia.docs[0]?.id ??
    (
      await payload.create({
        collection: "media",
        data: { alt: heroAlt },
        filePath: path.resolve("cms/seed-assets/hero-home.webp"),
      })
    ).id;

  // --- Asset upload helper -------------------------------------------------
  // Find-or-create a media doc by its alt text (idempotent for CI/local re-runs).
  const uploadMedia = async (alt: string, file: string): Promise<number> => {
    const found = await payload.find({
      collection: "media",
      where: { alt: { equals: alt } },
      limit: 1,
    });
    if (found.docs[0]) return found.docs[0].id as number;
    const created = await payload.create({
      collection: "media",
      data: { alt },
      filePath: path.resolve(file),
    });
    return created.id as number;
  };

  // --- Service hero images (Brief Part 10) ---------------------------------
  // One AI-generated hero per service line, owned by the CMS so an admin can swap any time.
  const SERVICE_HEROES: Record<string, { alt: string; file: string }> = {
    "solar-renewable": {
      alt: "Bangladeshi solar engineers installing monocrystalline PV panels on a factory rooftop in Chittagong",
      file: "cms/seed-assets/service-solar-renewable.webp",
    },
    "bess-storage": {
      alt: "Rows of lithium iron phosphate battery storage cabinets in a modern industrial BESS room",
      file: "cms/seed-assets/service-bess-storage.webp",
    },
    "lps-earthing": {
      alt: "Dramatic night lightning strikes connecting to a factory's air terminals and travelling safely to ground",
      file: "cms/seed-assets/service-lps-earthing.webp",
    },
    "electrical-epc": {
      alt: "Bangladeshi electrical engineer working on a high-voltage switchgear panel inside a modern substation",
      file: "cms/seed-assets/service-electrical-epc.webp",
    },
    "inspection-testing": {
      alt: "Engineer using a FLIR thermal imaging camera scanning an electrical panel, thermal heatmap overlay visible",
      file: "cms/seed-assets/service-inspection-testing.webp",
    },
    "substation-hv": {
      alt: "Modern industrial substation interior with power transformer, oil-filled HV equipment and control panels",
      file: "cms/seed-assets/service-substation-hv.webp",
    },
    "fire-safety": {
      alt: "Fire detection and alarm system panel being commissioned by an engineer in an industrial factory",
      file: "cms/seed-assets/service-fire-safety.webp",
    },
    "training-safety": {
      alt: "Bangladeshi industrial workers in a Bureau Veritas safety training session led by a trainer at a whiteboard",
      file: "cms/seed-assets/service-training-safety.webp",
    },
    "lighting-distribution": {
      alt: "Interior of the Sustech Technology Ltd retail showroom in Chittagong showcasing BESS cabinets, fans and lighting products",
      file: "cms/seed-assets/products-showroom.webp",
    },
  };
  for (const [slug, asset] of Object.entries(SERVICE_HEROES)) {
    const mediaId = await uploadMedia(asset.alt, asset.file);
    const found = await payload.find({
      collection: "services",
      where: { slug: { equals: slug } },
      limit: 1,
    });
    if (found.docs[0]) {
      await payload.update({
        collection: "services",
        id: found.docs[0].id,
        data: { heroImage: mediaId },
      });
    }
  }

  // --- Home hero background video (autoplay-muted-loop) --------------------
  const heroVideoId = await uploadMedia(
    "Sustech brand intro time-lapse — solar installation at sunrise to sunset on a Bangladeshi factory roof",
    "cms/seed-assets/hero-home-loop.mp4",
  );

  // --- Service explainer videos (BESS + LPS) -------------------------------
  // Short 10s autoplay-muted-loop animations rendered on the matching service page (Brief Part 10).
  const SERVICE_EXPLAINERS: Record<
    string,
    { videoAlt: string; videoFile: string; posterAlt: string; posterFile: string }
  > = {
    "bess-storage": {
      videoAlt:
        "Animation of electricity flowing from solar panels to battery storage cabinets to factory machines, blue and green energy flow lines",
      videoFile: "cms/seed-assets/service-bess-explainer.mp4",
      posterAlt: "BESS explainer animation poster — solar to battery to factory energy flow",
      posterFile: "cms/seed-assets/service-bess-explainer-poster.webp",
    },
    "lps-earthing": {
      videoAlt:
        "Slow-motion lightning strike connecting to a factory's air terminal and travelling safely down the conductor to ground",
      videoFile: "cms/seed-assets/service-lps-protection.mp4",
      posterAlt:
        "Lightning protection explainer poster — air terminal channelling a strike to ground",
      posterFile: "cms/seed-assets/service-lps-protection-poster.webp",
    },
  };
  for (const [slug, asset] of Object.entries(SERVICE_EXPLAINERS)) {
    const videoId = await uploadMedia(asset.videoAlt, asset.videoFile);
    const posterId = await uploadMedia(asset.posterAlt, asset.posterFile);
    const found = await payload.find({
      collection: "services",
      where: { slug: { equals: slug } },
      limit: 1,
    });
    if (found.docs[0]) {
      await payload.update({
        collection: "services",
        id: found.docs[0].id,
        data: { explainerVideo: videoId, explainerPoster: posterId },
      });
    }
  }

  // --- Team photos (3 confident matches; the rest are admin-owned uploads) -
  const TEAM_PHOTOS: Record<string, string> = {
    "Md. Sohel Sikder": "cms/seed-assets/team-sohel.webp",
    "Md. Kaium Sikdar": "cms/seed-assets/team-kaium.webp",
    "Asib Ahmed": "cms/seed-assets/team-asib.webp",
  };

  // --- Products & distribution (Brief Part 12 §6) --------------------------
  // Featured product cards rendered by the Product Showcase block. Admin-editable.
  const PRODUCTS: Array<{
    title: string;
    slug: string;
    brand?: string;
    category: "energy" | "solar" | "lighting" | "safety" | "power";
    summary: string;
    imageAlt: string;
    imageFile: string;
    externalUrl?: string;
    featured: boolean;
    order: number;
  }> = [
    {
      title: "Atomberg Gorilla BLDC Ceiling Fan",
      slug: "atomberg-gorilla-bldc-fan",
      brand: "Atomberg",
      category: "energy",
      summary:
        "65% energy savings vs conventional fans, BLDC motor, 5-star BEE-rated. Sustech is sole distributor for Bangladesh.",
      imageAlt:
        "Atomberg Gorilla BLDC ceiling fan installed in a bright modern Bangladeshi industrial workspace",
      imageFile: "cms/seed-assets/product-atomberg-fan.webp",
      featured: true,
      order: 1,
    },
    {
      title: "UFO High-Bay LED Luminaire",
      slug: "ufo-highbay-led",
      category: "lighting",
      summary:
        "Industrial-grade UFO high-bay LED for warehouses and production halls — high lumen output, low maintenance.",
      imageAlt: "Row of UFO high-bay LED lights illuminating a large warehouse interior",
      imageFile: "cms/seed-assets/product-led-highbay.webp",
      featured: true,
      order: 2,
    },
    {
      title: "Sustech Solar Street Light",
      slug: "solar-street-light",
      category: "solar",
      summary:
        "All-in-one solar street light with integrated PV, LiFePO4 battery and LED — dusk-to-dawn, no grid connection.",
      imageAlt:
        "Sustech solar street light at dusk, solar panel glowing with reflected sky, LED lamp beginning to illuminate",
      imageFile: "cms/seed-assets/product-solar-streetlight.webp",
      featured: true,
      order: 3,
    },
    {
      title: "Lightning Air Terminal & Down-Conductor",
      slug: "lps-air-terminal-system",
      category: "safety",
      summary:
        "IEC 62305-compliant air terminals and down-conductor systems — designed, installed and tested by Sustech.",
      imageAlt:
        "Sustech engineers installing a lightning air terminal on a factory roof in Bangladesh",
      imageFile: "cms/seed-assets/product-lps-airterminal.webp",
      featured: true,
      order: 4,
    },
  ];
  for (const p of PRODUCTS) {
    const imageId = await uploadMedia(p.imageAlt, p.imageFile);
    const data = {
      title: p.title,
      slug: p.slug,
      brand: p.brand,
      category: p.category,
      summary: p.summary,
      image: imageId,
      externalUrl: p.externalUrl,
      featured: p.featured,
      order: p.order,
    };
    const found = await payload.find({
      collection: "products",
      where: { slug: { equals: p.slug } },
      limit: 1,
    });
    if (found.docs[0]) {
      await payload.update({ collection: "products", id: found.docs[0].id, data });
    } else {
      await payload.create({ collection: "products", data });
    }
  }

  // --- Home page (from content/homepage-copy.md) ---------------------------
  const homeLayout = [
    {
      blockType: "hero",
      eyebrow: "EPC ENGINEERING · SINCE 2017",
      heading: "Single-point EPC for industrial power, solar and safety.",
      subhead:
        "Sustech designs, builds and commissions solar plants, substations, lightning protection " +
        "and smart electrical systems for commercial and industrial clients — engineered to IEC, " +
        "BNBC and NFPA standards, and delivered by one accountable team.",
      tone: "dark",
      backgroundImage: heroMediaId,
      backgroundVideo: heroVideoId,
      // Auto-scrolling media panel beside the hero text (fills the right-hand space).
      // "library" works out of the box; switch to "projects" once project galleries
      // have photos, or "manual" to curate the exact images/videos.
      sideMedia: { enabled: true, source: "library", interval: 5 },
      ctas: [
        customLink("Request a Consultation", "/request-quote", { style: "primary" }),
        customLink("See Our Projects", "/projects", { style: "secondary" }),
      ],
    },
    {
      blockType: "partnerBar",
      appearance: "muted",
      heading: "Our global technology partners",
      partners: [
        { name: "Atomberg" },
        { name: "Growatt" },
        { name: "Hithium" },
        { name: "JA Solar" },
        { name: "Jinko Solar" },
        { name: "Bureau Veritas" },
      ],
    },
    {
      blockType: "statsCounters",
      appearance: "muted",
      intro: "Proven across Bangladesh's industrial sector since 2017.",
      // Candidate figures from the 2017–2026 client/pipeline data — placeholders the admin/
      // Hermes confirms before launch (editable in the CMS; not hardcoded as final).
      stats: [
        { value: 175, suffix: "+", label: "Clients served" },
        { value: 103, suffix: "+", label: "Projects executed" },
        { value: 8, suffix: "+", label: "Years in operation" },
        { value: 100, suffix: "+ kWp", label: "Solar installed" },
      ],
    },
    {
      blockType: "servicesGrid",
      source: "auto",
      heading: "End-to-end engineering, under one roof.",
      lede: "Ten service lines covering an industrial facility's power, energy, safety and compliance — from design to commissioning.",
    },
    {
      blockType: "sectorTiles",
      source: "auto",
      appearance: "muted",
      heading: "Built for your industry.",
      lede: "We engineer to the realities of your sector — its loads, standards, downtime costs and compliance.",
    },
    {
      blockType: "projectsList",
      source: "featured",
      heading: "Engineering you can stand on.",
      lede: "A selection of recent industrial and commercial projects — scope, scale and outcome.",
    },
    {
      blockType: "richText",
      appearance: "muted",
      content: doc(
        heading("h2", "What sets us apart"),
        para(
          txt("In-house engineering, not resale. ", true),
          txt(
            "Our own engineers design every system — so the solution fits your site, not a catalogue.",
          ),
        ),
        para(
          txt("Compliant by design. ", true),
          txt(
            "Every project is engineered to IEC, BNBC and NFPA standards, documented and verifiable.",
          ),
        ),
        para(
          txt("A safety-first culture. ", true),
          txt("Protection of people and plant is engineered in, not bolted on."),
        ),
        para(
          txt("One accountable team. ", true),
          txt(
            "Single-point responsibility from design through procurement, construction and commissioning — no finger-pointing between vendors.",
          ),
        ),
        para(
          txt("Support that lasts. ", true),
          txt(
            "After-sales service and AMC keep your systems performing for their full design life.",
          ),
        ),
      ),
    },
    {
      blockType: "steps",
      eyebrow: "How we work",
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
    },
    {
      blockType: "logoWall",
      appearance: "muted",
      source: "auto",
      heading: "Trusted by leading industrial and commercial clients.",
    },
    {
      blockType: "calculatorEmbed",
      heading: "See the numbers before you commit.",
      body:
        "Estimate your solar capacity, savings and payback in minutes with our engineering " +
        "calculators — the same models our engineers use.",
      tool: "solarcalc",
      ctaLabel: "Try SolarCalc Pro",
    },
    {
      blockType: "testimonials",
      appearance: "muted",
      source: "auto",
      heading: "In our clients' words.",
    },
    {
      blockType: "productShowcase",
      source: "featured",
      heading: "Products & distribution.",
      lede:
        "Selected products and brands Sustech distributes, installs and supports across Bangladesh — " +
        "from energy-efficient fans to industrial lighting, solar street lights and lightning protection.",
    },
    {
      blockType: "articlesList",
      heading: "From our knowledge hub.",
      lede: "Practical engineering guidance for industrial Bangladesh — solar, safety, testing and compliance.",
    },
    {
      blockType: "ctaBand",
      heading: "Planning an industrial power, solar or safety project?",
      subhead:
        "Tell us what you're building. Our engineers will scope it with you — no obligation.",
      ctas: [customLink("Request a Consultation", "/request-quote", { style: "primary" })],
    },
  ];

  const existingHome = await payload.find({
    collection: "pages",
    where: { slug: { equals: "home" } },
    limit: 1,
  });
  const homeData = {
    title: "Home",
    slug: "home",
    _status: "published" as const,
    layout: homeLayout,
    seo: {
      title: "Sustech Technology Ltd — Industrial Solar, Electrical EPC & Safety Engineering",
      description:
        "Single-point EPC for commercial and industrial clients in Bangladesh: solar plants, " +
        "substations, lightning protection, smart systems and electrical testing, engineered to IEC, BNBC and NFPA standards.",
    },
  };
  if (existingHome.docs.length > 0) {
    await payload.update({
      collection: "pages",
      id: existingHome.docs[0]!.id,
      data: homeData,
    });
  } else {
    await payload.create({ collection: "pages", data: homeData });
  }

  // About — starter structure (draft). Generic copy uses only already-established facts;
  // real story, leadership photos/bios and any certifications are filled in the CMS.
  // --- Team (Brief Part 3) -------------------------------------------------
  for (const m of TEAM) {
    // Attach a real photo when we have a confident filename match. Other team members
    // upload their own photo via /admin → Team — we don't auto-assign faces.
    const photoFile = TEAM_PHOTOS[m.name];
    let photoId: number | undefined;
    if (photoFile) {
      photoId = await uploadMedia(`${m.name} — Sustech ${m.role}`, photoFile);
    }
    const data = photoId ? { ...m, photo: photoId } : m;
    const found = await payload.find({
      collection: "team",
      where: { name: { equals: m.name } },
      limit: 1,
    });
    if (found.docs.length === 0) await payload.create({ collection: "team", data });
    else await payload.update({ collection: "team", id: found.docs[0]!.id, data });
  }

  const aboutLayout = [
    {
      blockType: "hero",
      eyebrow: "About Sustech",
      heading: "Smart Energy. Strong Engineering. Sustainable Solution.",
      subhead:
        "Sustech Technology Ltd is one of Bangladesh's integrated engineering and energy solutions " +
        "companies — delivering Smart Energy, Strong Engineering and Sustainable Solutions since 2017.",
      tone: "dark",
      ctas: [
        customLink("Request a Consultation", "/request-quote", { style: "primary" }),
        customLink("See Our Projects", "/projects", { style: "secondary" }),
      ],
    },
    {
      blockType: "richText",
      content: doc(
        heading("h2", "Our story"),
        para(
          txt(
            "Founded in Chattogram in September 2017 by Md. Sohel Sikder — a CUET-educated engineer, " +
              "SREDA-certified Energy Auditor and Government-certified Fire Safety Manager — Sustech " +
              "began with a single commitment: deliver world-class electrical engineering to " +
              "Bangladesh's industrial heartland.",
          ),
        ),
        para(
          txt(
            "Eight years and 175+ client relationships later, Sustech operates across four verticals: " +
              "EPC & Electrical Works, Solar & Renewable Energy, Product Supply & Distribution, and " +
              "Inspection, Testing & Compliance. The company holds e-GP registration, PWD empanelment, " +
              "and references that span UN agencies (WFP), heritage institutions (CWGC / British " +
              "Embassy) and Bangladesh's largest garments exporters.",
          ),
        ),
        para(
          txt(
            "Headquartered in Chattogram's GEC corridor — the nerve centre of Bangladesh's engineering " +
              "and export economy — Sustech serves 40+ active clients across Chittagong Division, " +
              "Dhaka, Cox's Bazar and beyond.",
          ),
        ),
      ),
    },
    {
      blockType: "statsCounters",
      appearance: "muted",
      intro: "Eight years of engineering for Bangladesh's industrial sector.",
      stats: [
        { value: 175, suffix: "+", label: "Clients served" },
        { value: 103, suffix: "+", label: "Projects executed" },
        { value: 8, suffix: "+", label: "Years in operation" },
        { value: 100, suffix: "+ kWp", label: "Solar installed" },
      ],
    },
    {
      blockType: "richText",
      content: doc(
        heading("h2", "Mission & vision"),
        para(txt("Mission. ", true), txt(MISSION)),
        para(txt("Vision. ", true), txt(VISION)),
      ),
    },
    {
      blockType: "steps",
      eyebrow: "What we stand for",
      heading: "Our values.",
      steps: VALUES,
    },
    {
      blockType: "teamGrid",
      appearance: "muted",
      source: "auto",
      heading: "Leadership & team",
      lede: "Engineers and leaders behind Sustech's projects.",
    },
    {
      blockType: "richText",
      content: doc(heading("h2", "Certifications & credentials"), ...CERTIFICATIONS),
    },
    {
      blockType: "richText",
      appearance: "muted",
      content: doc(heading("h2", "Strategic partnerships"), ...PARTNERSHIPS),
    },
    {
      blockType: "ctaBand",
      heading: "Want to work with us?",
      subhead: "Tell us about your project — our engineers will scope it with you, no obligation.",
      ctas: [customLink("Request a Consultation", "/request-quote", { style: "primary" })],
    },
  ];
  const existingAbout = await payload.find({
    collection: "pages",
    where: { slug: { equals: "about" } },
    limit: 1,
    draft: true,
  });
  const aboutData = {
    title: "About",
    slug: "about",
    _status: "published" as const,
    layout: aboutLayout,
    seo: {
      title: "About Sustech Technology Ltd — Engineering & Energy in Chattogram, Bangladesh",
      description:
        "Founded 2017 in Chattogram, Sustech delivers solar EPC, BESS, electrical works, lightning " +
        "protection, substation and inspection & testing across Bangladesh — 175+ clients, 103+ projects.",
    },
  };
  if (existingAbout.docs.length > 0) {
    await payload.update({ collection: "pages", id: existingAbout.docs[0]!.id, data: aboutData });
  } else {
    await payload.create({ collection: "pages", data: aboutData });
  }

  // Capabilities — a published overview page assembled from existing blocks.
  const capabilitiesLayout = [
    {
      blockType: "hero",
      eyebrow: "Capabilities",
      heading: "Everything an industrial facility needs, engineered under one roof.",
      subhead:
        "From solar and substations to lightning protection, smart controls and electrical " +
        "testing — Sustech engineers, builds and commissions the full electrical and energy " +
        "scope to IEC, BNBC and NFPA standards, with single-point accountability.",
      tone: "dark",
      ctas: [
        customLink("Request a Consultation", "/request-quote", { style: "primary" }),
        customLink("See Our Projects", "/projects", { style: "secondary" }),
      ],
    },
    {
      blockType: "servicesGrid",
      source: "auto",
      heading: "Ten service lines, one accountable team.",
      lede: "Covering an industrial facility's power, safety and compliance from design to commissioning.",
    },
    {
      blockType: "statsCounters",
      appearance: "muted",
      intro: "Proven across Bangladesh's industrial sector since 2017.",
      stats: [
        { value: 175, suffix: "+", label: "Clients served" },
        { value: 103, suffix: "+", label: "Projects executed" },
        { value: 8, suffix: "+", label: "Years in operation" },
        { value: 100, suffix: "+ kWp", label: "Solar installed" },
      ],
    },
    {
      blockType: "sectorTiles",
      source: "auto",
      heading: "Built for your industry.",
      lede: "We engineer to the realities of your sector — its loads, standards and compliance.",
    },
    {
      blockType: "steps",
      eyebrow: "How we work",
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
    },
    {
      blockType: "logoWall",
      appearance: "muted",
      source: "auto",
      heading: "Trusted by leading industrial and commercial clients.",
    },
    {
      blockType: "ctaBand",
      heading: "Have a project in mind?",
      subhead:
        "Tell us what you're building — our engineers will scope it with you, no obligation.",
      ctas: [customLink("Request a Consultation", "/request-quote", { style: "primary" })],
    },
  ];
  const existingCapabilities = await payload.find({
    collection: "pages",
    where: { slug: { equals: "capabilities" } },
    limit: 1,
    draft: true,
  });
  const capabilitiesData = {
    title: "Capabilities",
    slug: "capabilities",
    _status: "published" as const,
    layout: capabilitiesLayout,
    seo: {
      title: "Capabilities — Sustech Technology Ltd",
      description:
        "Sustech's full EPC engineering capability for commercial and industrial clients in " +
        "Bangladesh: solar, electrical, grounding & lightning protection, smart systems and testing.",
    },
  };
  if (existingCapabilities.docs.length > 0) {
    await payload.update({
      collection: "pages",
      id: existingCapabilities.docs[0]!.id,
      data: capabilitiesData,
    });
  } else {
    await payload.create({ collection: "pages", data: capabilitiesData });
  }

  // A draft page (work-in-progress) — demonstrates draft status and stays 404 publicly.
  // (Slug `careers`, not `contact`: /contact is now a real route.)
  const existingDraft = await payload.find({
    collection: "pages",
    where: { slug: { equals: "careers" } },
    limit: 1,
    draft: true,
  });
  if (existingDraft.docs.length === 0) {
    await payload.create({
      collection: "pages",
      data: {
        title: "Careers",
        slug: "careers",
        _status: "draft",
        layout: [
          {
            blockType: "ctaBand",
            heading: "Careers at Sustech",
            subhead: "This page is being prepared.",
          },
        ],
      },
    });
  }

  // --- Knowledge articles --------------------------------------------------
  for (const a of ARTICLES) {
    const found = await payload.find({
      collection: "articles",
      where: { slug: { equals: a.slug } },
      limit: 1,
      draft: true,
    });
    if (found.docs.length === 0) {
      await payload.create({ collection: "articles", data: a });
      payload.logger.info(`Created article: ${a.title}`);
    } else {
      await payload.update({ collection: "articles", id: found.docs[0].id, data: a });
      payload.logger.info(`Updated article: ${a.title}`);
    }
  }

  payload.logger.info(
    "Seed complete: services, sectors, navigation, settings, articles, home + draft page.",
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
