import "./load-env";
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
    slug: "solar-energy",
    title: "Solar & Energy",
    icon: "solar" as const,
    order: 1,
    summary:
      "Grid-tied, hybrid and rooftop solar, plus energy audits that cut your power bill and carbon.",
  },
  {
    slug: "electrical-epc",
    title: "Electrical EPC",
    icon: "electrical" as const,
    order: 2,
    summary:
      "Substations, panel boards and power distribution, engineered, built and commissioned to code.",
  },
  {
    slug: "grounding-lightning-protection",
    title: "Grounding & Lightning Protection",
    icon: "grounding" as const,
    order: 3,
    summary:
      "IEC/NFPA-compliant earthing and lightning protection that safeguards people, plant and uptime.",
  },
  {
    slug: "smart-systems",
    title: "Smart Systems",
    icon: "smart" as const,
    order: 4,
    summary:
      "PLC automation, industrial lighting and intelligent controls that make your facility efficient and observable.",
  },
  {
    slug: "testing-inspection-consultancy",
    title: "Testing, Inspection & Consultancy",
    icon: "testing" as const,
    order: 5,
    summary:
      "Insulation and earth-resistance (IR/ER) testing, thermography, electrical audits and safety inspection that keep your facility compliant, reliable and safe.",
  },
];

const SECTORS = [
  {
    slug: "manufacturing-rmg-textile",
    title: "Manufacturing & RMG / Textile",
    icon: "manufacturing" as const,
    order: 1,
    summary: "Reliable power and safety for high-uptime production floors.",
  },
  {
    slug: "power-utilities",
    title: "Power & Utilities",
    icon: "power" as const,
    order: 2,
    summary: "Substation and grid-side engineering built to utility standards.",
  },
  {
    slug: "commercial-real-estate",
    title: "Commercial Real Estate",
    icon: "commercial" as const,
    order: 3,
    summary: "Efficient, compliant electrical and solar systems for commercial buildings.",
  },
  {
    slug: "ports-heavy-industry",
    title: "Ports & Heavy Industry",
    icon: "ports" as const,
    order: 4,
    summary: "Robust power, protection and automation for demanding environments.",
  },
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
    const found = await payload.find({
      collection: "services",
      where: { slug: { equals: s.slug } },
      limit: 1,
    });
    if (found.docs.length === 0) await payload.create({ collection: "services", data: s });
  }
  for (const s of SECTORS) {
    const found = await payload.find({
      collection: "sectors",
      where: { slug: { equals: s.slug } },
      limit: 1,
    });
    if (found.docs.length === 0) await payload.create({ collection: "sectors", data: s });
  }

  // --- SiteSettings --------------------------------------------------------
  await payload.updateGlobal({
    slug: "site-settings",
    data: {
      companyName: "Sustech Technology Ltd",
      shortName: "Sustech",
      tagline: "Single-point EPC for industrial power, solar and safety.",
      description:
        "Single-point EPC for commercial and industrial clients in Bangladesh: solar plants, " +
        "substations, lightning protection, smart systems and electrical testing, engineered to IEC, BNBC and NFPA standards.",
      foundingYear: 2017,
      areaServed: "Bangladesh",
      // Contact details are intentionally left blank until confirmed (no invented values).
      defaultTitle:
        "Sustech Technology Ltd — Industrial Solar, Electrical EPC & Safety Engineering",
      titleTemplate: "%s · Sustech Technology Ltd",
      defaultDescription:
        "Single-point EPC for commercial and industrial clients in Bangladesh: solar plants, " +
        "substations, lightning protection, smart systems and electrical testing, engineered to IEC, BNBC and NFPA standards.",
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
      ctas: [
        customLink("Request a Consultation", "/request-quote", { style: "primary" }),
        customLink("See Our Projects", "/projects", { style: "secondary" }),
      ],
    },
    {
      blockType: "statsCounters",
      appearance: "muted",
      intro: "Proven across Bangladesh's industrial sector since 2017.",
      // Candidate figures from the 2017–2026 client/pipeline data — placeholders the admin/
      // Hermes confirms before launch (editable in the CMS; not hardcoded as final).
      stats: [
        { value: 9, label: "Years of engineering" },
        { value: 50, suffix: "+", label: "Clients served" },
        { value: 95, suffix: "+", label: "Projects delivered" },
        { value: 13, label: "Service lines" },
      ],
    },
    {
      blockType: "servicesGrid",
      source: "auto",
      heading: "End-to-end engineering, under one roof.",
      lede: "Five capabilities that cover an industrial facility's power, safety and compliance from design to commissioning.",
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

  // A draft page (work-in-progress) — demonstrates draft status and stays 404 publicly.
  const existingDraft = await payload.find({
    collection: "pages",
    where: { slug: { equals: "contact" } },
    limit: 1,
    draft: true,
  });
  if (existingDraft.docs.length === 0) {
    await payload.create({
      collection: "pages",
      data: {
        title: "Contact",
        slug: "contact",
        _status: "draft",
        layout: [
          {
            blockType: "contactRFQ",
            heading: "Contact us",
            subhead: "This page is being prepared.",
          },
        ],
      },
    });
  }

  payload.logger.info("Seed complete: services, sectors, navigation, settings, home + draft page.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
