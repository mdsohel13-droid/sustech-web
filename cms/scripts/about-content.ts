/**
 * About page content — the single source of truth for the /about page.
 *
 * Imported by:
 *  - seed.ts          (full first-run / rebuild seed)
 *  - apply-about.ts   (targeted "update only the About page" apply — safe to run
 *                      against a live DB without touching any other content)
 *
 * The page presents Sustech's six capabilities in parallel (solar, BESS,
 * electrical EPC, industrial lighting, energy-saving fans, and electrical
 * compliance/testing) rather than framing the company as solar/ESS-only.
 * All figures are real per the company brief; edit here and both the seed and
 * the targeted apply stay in lock-step.
 */
import { customLink, doc, heading, para, txt } from "./lexical";

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

const aboutLayout = [
  {
    blockType: "hero",
    eyebrow: "About Sustech",
    heading: "Smart Energy. Strong Engineering. Sustainable Solution.",
    subhead:
      "One accountable engineering partner for six industrial essentials — solar power, battery " +
      "energy storage, electrical EPC, industrial lighting, energy-saving BLDC fans and complete " +
      "electrical compliance: testing, inspection and auditing. Engineering for Bangladesh's " +
      "industry since 2017.",
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
          "Eight years and 175+ client relationships later, Sustech delivers six core capabilities " +
            "in parallel — solar power, battery energy storage (BESS), electrical EPC, industrial " +
            "lighting, energy-saving BLDC fans and complete electrical compliance (testing, " +
            "inspection and auditing). No sub-contracting the hard parts: one team designs, " +
            "supplies, installs, tests and certifies the full scope. The company holds e-GP " +
            "registration, PWD empanelment, and references that span UN agencies (WFP), heritage " +
            "institutions (CWGC / British Embassy) and Bangladesh's largest garments exporters.",
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
    blockType: "steps",
    eyebrow: "What we do",
    heading: "Six capabilities. One accountable team.",
    steps: [
      {
        title: "Solar Power",
        body:
          "On-grid, off-grid and hybrid PV — from rooftop to utility scale. Designed, supplied, " +
          "installed and commissioned to SREDA net-metering and IEC standards.",
      },
      {
        title: "Battery Energy Storage (BESS)",
        body:
          "Lithium (LFP) storage from portable units to 1 MWh+ — backup, peak-shaving, " +
          "load-shifting and microgrids that cut diesel, noise and downtime.",
      },
      {
        title: "Electrical EPC",
        body:
          "Full MEP and electrical works — factory wiring, panels, switchgear, substations and " +
          "HT/LT distribution, engineered and built to BNBC, IEC and NEC.",
      },
      {
        title: "Industrial Lighting",
        body:
          "Energy-efficient LED and solar lighting engineered for lux, uptime and lower running " +
          "cost across factories, warehouses, yards and public spaces.",
      },
      {
        title: "Energy-Saving Fans",
        body:
          "Atomberg BLDC fans — sole distributor for Bangladesh. Up to 65% less energy than " +
          "conventional induction fans, delivering comfort and savings at industrial scale.",
      },
      {
        title: "Compliance & Testing",
        body:
          "Complete electrical compliance — IR thermography, insulation and earth-resistance " +
          "testing, SREDA energy audits and DIFE / third-party inspection, audit and survey.",
      },
    ],
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

export const aboutData = {
  title: "About",
  slug: "about",
  _status: "published" as const,
  layout: aboutLayout,
  seo: {
    title: "About Sustech Technology Ltd — Engineering & Energy in Chattogram, Bangladesh",
    description:
      "Founded 2017 in Chattogram, Sustech delivers six capabilities in parallel — solar power, " +
      "battery storage (BESS), electrical EPC, industrial lighting, energy-saving fans and " +
      "electrical compliance (testing, inspection & auditing) — 175+ clients, 103+ projects.",
  },
};
