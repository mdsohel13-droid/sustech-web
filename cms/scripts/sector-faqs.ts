/**
 * Per-sector FAQ content — the single source of truth for sector/solution page FAQs.
 *
 * Imported by:
 *  - seed.ts             (merged into each sector on a full seed)
 *  - apply-sector-faqs.ts (targeted apply: patches only the `faqs` field of each
 *                          existing sector — safe to run against a live DB)
 *
 * Why: the sector pages render `sector.faqs` as visible Q&A AND emit FAQPage
 * JSON-LD, but no FAQs were ever seeded, so every industry page shipped with none.
 * FAQPage is the strongest GEO/AEO (AI answer engine) signal available.
 *
 * All answers mirror confirmed capabilities, standards and references from the
 * company brief — no invented figures, client names or certifications.
 */
export const SECTOR_FAQS: Record<string, { question: string; answer: string }[]> = {
  "garments-rmg": [
    {
      question:
        "What electrical and energy services does Sustech provide for garments and RMG factories?",
      answer:
        "Sustech delivers substation and HT/LT electrical EPC, rooftop solar, battery energy " +
        "storage, lightning protection and electrical testing for RMG and textile factories — " +
        "engineered for high-uptime production and for ACCORD/RSC and DIFE electrical-safety compliance.",
    },
    {
      question: "Can Sustech help an RMG factory meet ACCORD / RSC electrical-safety requirements?",
      answer:
        "Yes. We carry out electrical inspections, IR thermography, earthing and lightning-protection " +
        "testing and the remediation works that support ACCORD/RSC and DIFE electrical-safety compliance.",
    },
    {
      question: "How can a garment factory cut its energy cost?",
      answer:
        "Through rooftop solar under SREDA net metering, energy-efficient LED lighting and BLDC fans, " +
        "power-factor improvement and SREDA energy audits that reduce both consumption and demand charges.",
    },
  ],
  government: [
    {
      question: "Is Sustech eligible for government and public-sector electrical works?",
      answer:
        "Yes. Sustech is PWD-empanelled and e-GP registered, and executes electrical EPC, substation " +
        "and solar projects for government and public-sector clients to IEC, IEEE, NFPA, BNBC and NEC standards.",
    },
    {
      question: "Can Sustech support e-GP tenders?",
      answer:
        "Yes — we provide e-GP tender support with engineering BOQs, drawings and compliance " +
        "documentation that stand up to procurement and audit scrutiny.",
    },
    {
      question: "What kinds of public-sector projects does Sustech deliver?",
      answer:
        "Electrical, substation, solar, lightning-protection and safety works for government offices, " +
        "institutions and public facilities — engineered, built, tested and documented by one team.",
    },
  ],
  "ngo-un": [
    {
      question: "Does Sustech work with UN agencies and NGOs?",
      answer:
        "Yes. Sustech has delivered engineering for UN and humanitarian clients (including the World " +
        "Food Programme) and designs to UN-grade reliability, including off-grid solar for remote sites.",
    },
    {
      question: "Can Sustech power off-grid or remote humanitarian facilities?",
      answer:
        "Yes — off-grid and hybrid solar with lithium (LFP) battery storage keeps clinics, offices and " +
        "camps running where the grid is unreliable or absent, with low running cost and no fuel logistics.",
    },
    {
      question: "How does Sustech ensure accountability on donor-funded projects?",
      answer:
        "With transparent BOQs, international-standard engineering (IEC/IEEE/NFPA), documented testing " +
        "and single-point accountability from design through commissioning and handover.",
    },
  ],
  "industrial-chemical": [
    {
      question:
        "What electrical engineering does Sustech provide for industrial and chemical plants?",
      answer:
        "Substation and HT/LT electrical EPC, earthing and lightning protection, fire detection, " +
        "electrical testing and solar — engineered for the loads, continuity and safety demands of " +
        "industrial and chemical processing plants.",
    },
    {
      question: "Does Sustech address electrical safety in hazardous or demanding environments?",
      answer:
        "Yes — earthing and bonding to IEEE 80, lightning protection to IEC 62305 / NFPA 780, IR " +
        "thermography and insulation testing, plus fire detection and alarm systems designed to standard.",
    },
    {
      question: "Can Sustech improve power reliability for continuous process plants?",
      answer:
        "Yes — substation design, power-factor improvement, backup and battery energy storage, and " +
        "preventive testing that reduce unplanned downtime on continuous production lines.",
    },
  ],
  "ports-logistics": [
    {
      question: "What services does Sustech offer ports, terminals and logistics facilities?",
      answer:
        "Power distribution, substation works, high-mast and yard lighting, lightning protection, " +
        "electrical testing and solar for ports, container terminals and logistics infrastructure.",
    },
    {
      question: "Can Sustech provide high-mast and yard lighting for large sites?",
      answer:
        "Yes — energy-efficient LED high-mast, flood and yard lighting engineered for the lux levels, " +
        "coverage and uptime that ports and logistics yards require.",
    },
    {
      question: "How does Sustech protect port electrical infrastructure from lightning?",
      answer:
        "With lightning-protection systems to IEC 62305 / NFPA 780 and earthing to IEEE 80, plus " +
        "scheduled re-testing to keep protection effective in exposed coastal environments.",
    },
  ],
  healthcare: [
    {
      question:
        "What electrical and energy services does Sustech provide for hospitals and healthcare?",
      answer:
        "Resilient power distribution, substation works, backup and battery energy storage, earthing " +
        "for sensitive medical equipment, fire detection and solar — engineered for continuity and compliance.",
    },
    {
      question: "Can Sustech ensure uninterrupted power for critical healthcare loads?",
      answer:
        "Yes — through backup power, lithium battery energy storage and well-designed distribution so " +
        "critical care, imaging and cold-chain loads stay powered through outages.",
    },
    {
      question: "Does Sustech handle earthing for sensitive medical equipment?",
      answer:
        "Yes — dedicated earthing and bonding to IEEE 80 and IEC standards protect both staff and " +
        "sensitive diagnostic and life-support equipment.",
    },
  ],
  academic: [
    {
      question: "What does Sustech provide for universities, schools and TVET institutions?",
      answer:
        "Rooftop solar, electrical EPC, substation works, lighting, lightning protection and electrical " +
        "safety training for academic and TVET campuses across Bangladesh.",
    },
    {
      question: "Can a campus reduce its electricity bill with solar?",
      answer:
        "Yes — rooftop solar under SREDA net metering, combined with efficient LED lighting and BLDC " +
        "fans, cuts a campus electricity bill while supporting sustainability goals.",
    },
    {
      question: "Does Sustech offer electrical-safety training for institutions?",
      answer:
        "Yes — as a Bureau Veritas channel partner, Sustech delivers occupational, electrical-safety " +
        "and LOTO training alongside its engineering works.",
    },
  ],
  "food-processing": [
    {
      question: "What electrical services does Sustech provide for food-processing facilities?",
      answer:
        "Reliable power distribution, substation works, controls, lighting, earthing and solar — " +
        "engineered for hygienic, continuous food-processing and cold-chain operations.",
    },
    {
      question: "Can Sustech support cold-chain reliability?",
      answer:
        "Yes — resilient distribution, backup and battery energy storage keep refrigeration and " +
        "cold-chain loads running, protecting product through power interruptions.",
    },
    {
      question: "How can a food plant lower its energy cost?",
      answer:
        "With rooftop solar (SREDA net metering), energy-efficient lighting and fans, power-factor " +
        "correction and an energy audit that targets the plant's largest loads.",
    },
  ],
  commercial: [
    {
      question: "What does Sustech provide for commercial buildings and hospitality?",
      answer:
        "Electrical EPC, rooftop solar, energy storage, efficient lighting and BLDC fans, smart " +
        "controls and electrical testing for commercial buildings, hotels and hospitality venues.",
    },
    {
      question: "Can solar and storage cut running costs for a commercial building?",
      answer:
        "Yes — rooftop solar with net metering plus battery storage reduces grid bills and demand " +
        "charges, while efficient lighting and BLDC fans lower baseline consumption.",
    },
    {
      question: "Does Sustech install smart building and energy-management systems?",
      answer:
        "Yes — IoT energy monitoring and smart controls that give facility teams visibility and " +
        "automated control over lighting, HVAC and energy use.",
    },
  ],
  heritage: [
    {
      question: "Can Sustech work on heritage and culturally sensitive sites?",
      answer:
        "Yes. Sustech has delivered sensitive, low-intrusion engineering for heritage and institutional " +
        "clients (including CWGC and the British Embassy), balancing modern safety with minimal disturbance.",
    },
    {
      question: "How does Sustech minimise disruption to a heritage structure?",
      answer:
        "With discreet routing, reversible fixings where possible, and careful lightning-protection and " +
        "electrical design that protects the structure without compromising its character.",
    },
    {
      question: "Does Sustech provide lightning protection for heritage buildings?",
      answer:
        "Yes — lightning-protection systems to IEC 62305 / NFPA 780, designed to safeguard historic " +
        "structures and their occupants with the least possible visual and physical intrusion.",
    },
  ],
};
