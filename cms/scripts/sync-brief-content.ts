/**
 * sync-brief-content — align Site Settings with the official company brief.
 *
 * Source of truth: "Sustech_Website_Developer_Brief.md" + the bilingual chatbot
 * knowledge base (both dated 10 June 2026, provided by the client). This script
 * updates ONLY the Site Settings global — pages/blocks stay untouched — and is
 * idempotent: re-running it applies the same values again.
 *
 * Run (locally or on the VPS):   pnpm sync:brief
 *
 * ⚠️ Per the brief (§17) two values were flagged "confirm before launch" and are
 * applied here exactly as the brief directs:
 *   - Primary phone/WhatsApp +880 1722-002125 ("use as primary"); the previous
 *     primary (+880 1867-655599) is kept as a secondary line.
 *   - Hours Saturday–Thursday (Friday + govt holidays closed) — the seed wrongly
 *     said Sunday–Thursday.
 */
import "./load-env";
import { getPayload } from "payload";
import config from "../../payload.config";

const payload = await getPayload({ config });

await payload.updateGlobal({
  slug: "site-settings",
  data: {
    companyName: "Sustech Technology Ltd",
    shortName: "Sustech",
    tagline: "Renewable Energy & Electrical Engineering Solutions — Complete EPC",
    description:
      "Sustech Technology Ltd is a Bangladesh-based renewable energy and electrical engineering " +
      "company delivering complete EPC (Engineering, Procurement & Construction) solutions — " +
      "solar power, lithium energy storage (ESS), substations & switchgear, industrial lighting, " +
      "energy-efficient fans, fire & PA systems, lightning protection and certified safety " +
      "training — for industrial, commercial and institutional clients across Bangladesh.",
    phones: [{ number: "+880 1722-002125" }, { number: "+880 1867-655599" }],
    emails: [
      { address: "info@sustechltd.com", label: "Primary" },
      { address: "sustechltd@gmail.com", label: "General" },
      { address: "sohel@sustechltd.com", label: "Direct" },
    ],
    address: {
      street: "House #1834 (SH Homes), Shantidhara R/A (Bata-goli), GEC, Nasirabad",
      city: "Chattogram",
      region: "Chattogram",
      postalCode: "4000",
      country: "BD",
    },
    hours: "Saturday–Thursday, 9:00 AM–6:00 PM · Friday & govt holidays closed",
    social: [
      { label: "Facebook", url: "https://www.facebook.com/sustechltd" },
      { label: "LinkedIn", url: "https://www.linkedin.com/company/71629589" },
    ],

    /* ── GEO / AEO — authoritative context emitted into /llms.txt ─────────── */
    aiOverview:
      "Sustech Technology Ltd is a Bangladesh-based renewable energy and electrical engineering " +
      "company headquartered in Chattogram (with a physical showroom), serving clients all over " +
      "Bangladesh. It provides complete EPC solutions across seven focus areas: industrial LED " +
      "lighting, switches & sockets (including ATEX-certified explosion-proof lights); solar power " +
      "(on-grid net metering, off-grid and hybrid, plus PPA and rooftop-lease models); lithium LFP " +
      "energy storage systems from portable to utility scale; energy-efficient Atomberg BLDC fans; " +
      "substation & switchgear works (transformers, LV/MV panels, PFI, cables, lightning " +
      "protection per IEC 62305); BOSCH fire detection & public-address systems; and Bureau " +
      "Veritas-aligned workplace safety training. Products are sourced directly from " +
      "manufacturers in China, India and the EU.",
    keyFacts: [
      {
        fact: "Complete EPC partner — engineering, procurement, construction and after-sales under one roof",
      },
      { fact: "Head office and showroom in Chattogram; services delivered all over Bangladesh" },
      {
        fact: "Solar EPC: on-grid (net metering), off-grid and hybrid, with PPA and rooftop-lease options",
      },
      {
        fact: "Lithium (LFP) energy storage from portable units to utility scale (e.g. 1.5 MW / 2.89 MWh)",
      },
      {
        fact: "Brand partners include Growatt, Atomberg, Jinko Solar, Solis, Hithium, Schneider, BOSCH and Bureau Veritas",
      },
      {
        fact: "Atomberg BLDC fans (BEE 5-star, BSTI) use up to ~65% less electricity than conventional fans",
      },
      { fact: "Lightning protection & earthing designed per IEC 62305 / NFC 17-102" },
      { fact: "ATEX-certified explosion-proof lighting (IP65/IP66) for hazardous areas" },
      {
        fact: "Field delivery includes UN World Food Programme sites, Cox's Bazar Rail Project street lighting and Matarbari transformer testing",
      },
      { fact: "Direct product sourcing from China, India and the EU" },
    ],
    aiFaqs: [
      {
        question: "What does Sustech Technology Ltd do?",
        answer:
          "Sustech provides complete EPC solutions in solar power, energy storage (ESS), " +
          "substation & switchgear, industrial lighting, energy-saving fans, fire & PA systems, " +
          "lightning protection and safety training across Bangladesh.",
      },
      {
        question: "How do I get a quote from Sustech?",
        answer:
          "Message Sustech on WhatsApp at +880 1722-002125 or email info@sustechltd.com with " +
          "your requirement, or use the Request a Consultation form on the website.",
      },
      {
        question: "Does Sustech serve areas outside Chattogram?",
        answer:
          "Yes — Sustech serves all of Bangladesh from its Chattogram head office, including " +
          "Dhaka, Cox's Bazar, Bhasanchar, Matarbari and EPZ/industrial zones.",
      },
      {
        question: "Can I get rooftop solar without a big upfront cost?",
        answer:
          "Yes — Sustech offers PPA (Power Purchase Agreement) and rooftop-lease models so " +
          "clients can adopt solar with zero or low upfront investment.",
      },
      {
        question: "Why choose an ESS over a diesel generator?",
        answer:
          "Lithium (LFP) energy storage offers lower running cost, no fuel, noise or emissions, " +
          "and a long cycle life compared with diesel generators.",
      },
      {
        question: "Does Sustech supply explosion-proof (ATEX) lighting?",
        answer:
          "Yes — ATEX-certified, IP65/IP66 explosion-proof lights, emergency and sign lights for " +
          "hazardous industrial areas.",
      },
      {
        question: "Does Sustech handle transformers and substations?",
        answer:
          "Yes — transformer supply, testing and oil filtering, LV/MV panels, PFI/capacitor " +
          "banks, cables and trays, and lightning protection & earthing per IEC 62305.",
      },
      {
        question: "Does Sustech provide safety training?",
        answer:
          "Yes — Bureau Veritas-aligned workplace safety training (safety orientation, fire & " +
          "electrical safety, hazard awareness) for factories and garments.",
      },
      {
        question: "What are Sustech's office hours?",
        answer: "Saturday–Thursday, 9:00 AM–6:00 PM. Friday and government holidays are closed.",
      },
      {
        question: "Can Sustech visit my site for a survey?",
        answer:
          "Yes — share your location and requirement on WhatsApp +880 1722-002125 and the team " +
          "will arrange a site visit.",
      },
    ],

    /* ── Chatbot quick-reply chips aligned to the 7 focus areas ───────────── */
    chatSuggestions: [
      { text: "Get a quote" },
      { text: "Rooftop solar (PPA / lease)" },
      { text: "ESS instead of a diesel generator" },
      { text: "Atomberg energy-saving fans" },
      { text: "Safety training for my factory" },
    ],
  },
});

const g = await payload.findGlobal({ slug: "site-settings" });
process.stdout.write(
  "✓ Site Settings synced to the company brief.\n" +
    `  tagline   : ${g.tagline}\n` +
    `  phones    : ${(g.phones ?? []).map((p) => p.number).join(" · ")}\n` +
    `  emails    : ${(g.emails ?? []).map((e) => e.address).join(" · ")}\n` +
    `  address   : ${g.address?.street}\n` +
    `  hours     : ${g.hours}\n` +
    `  keyFacts  : ${(g.keyFacts ?? []).length} · aiFaqs: ${(g.aiFaqs ?? []).length} · chips: ${(g.chatSuggestions ?? []).length}\n`,
);
process.exit(0);
