/**
 * apply-services.ts — targeted apply for the "fans & lighting" pillar split.
 *
 * Splits the old bundled "Lighting & Product Supply" service into three distinct,
 * citable service pages — Industrial Lighting, Energy-Saving Fans, and a refocused
 * Product Supply & Distribution — and fixes the display order of the trailing
 * services. Mirrors the same definitions in seed.ts (the ongoing source of truth);
 * this script is the safe one-time apply for an existing / live DB — it touches
 * only these service documents, not any other collection.
 *
 * Requires the `fan` icon enum value (migration 20261017_190000_service_icon_fan).
 *
 * Usage (where DATABASE_URI points at the target DB — e.g. on the VPS):
 *   pnpm migrate            # adds the 'fan' enum value
 *   pnpm apply:services     # then this
 *   # rebuild + restart so the new /services/* pages render
 */
import "./load-env";
import { getPayload } from "payload";
import config from "../../payload.config";
import { doc, para, txt } from "./lexical";

const sd = (scope: string[], standards: string, faq: { question: string; answer: string }[]) => ({
  scope: doc(...scope.map((t) => para(txt(t)))),
  standards: doc(para(txt(standards))),
  faq,
});

const NEW_OR_CHANGED = [
  {
    base: {
      slug: "industrial-lighting",
      title: "Industrial Lighting",
      icon: "lighting" as const,
      order: 8,
      summary:
        "Energy-efficient LED and solar lighting — high-bay, floodlight, street and architectural — engineered for lux, uptime and lower running cost.",
    },
    detail: sd(
      [
        "Energy-efficient industrial and architectural lighting — LED high-bay, floodlight, street, yard and solar lighting — designed to the required lux levels for factories, warehouses, yards and public spaces.",
      ],
      "Lighting designed to required lux levels (BNBC / illumination best practice) with energy-efficient LED and solar fixtures.",
      [
        {
          question: "What kinds of lighting does Sustech design and install?",
          answer:
            "LED high-bay and low-bay, floodlights, street and high-mast lighting, architectural and solar lighting — engineered to the required lux levels for the space.",
        },
        {
          question: "How does efficient lighting cut running cost?",
          answer:
            "LED fixtures draw far less power than conventional lighting and last longer, cutting both energy and maintenance cost; solar lighting removes the running cost entirely for suitable outdoor areas.",
        },
      ],
    ),
  },
  {
    base: {
      slug: "energy-saving-fans",
      title: "Energy-Saving Fans",
      icon: "fan" as const,
      order: 9,
      summary:
        "Atomberg BLDC ceiling and industrial fans (sole Bangladesh distributor) — up to 65% less energy than conventional induction fans.",
    },
    detail: sd(
      [
        "Supply and installation of Atomberg BLDC ceiling and industrial fans — Sustech is the sole distributor for Bangladesh — for factories, offices, commercial and institutional spaces.",
      ],
      "BLDC (brushless DC) fan technology rated at up to 65% lower energy use than conventional induction fans.",
      [
        {
          question: "How much energy do BLDC fans save?",
          answer:
            "Atomberg BLDC fans use up to 65% less energy than conventional induction fans while delivering the same airflow — the saving scales with the number of fans and running hours.",
        },
        {
          question: "Is Sustech the official Atomberg distributor in Bangladesh?",
          answer:
            "Yes — Sustech is the sole distributor of Atomberg BLDC fans in Bangladesh, so products are supplied and warranted through official channels.",
        },
      ],
    ),
  },
  {
    base: {
      slug: "lighting-distribution",
      title: "Product Supply & Distribution",
      icon: "electrical" as const,
      order: 10,
      summary:
        "Authorised supply of solar modules, inverters, batteries, LED lighting, BLDC fans and electrical products from our partner brands.",
    },
    detail: sd(
      [
        "Authorised supply and distribution of solar modules, inverters, batteries and energy-storage cabinets, LED lighting, BLDC fans and electrical products from our partner brands — Growatt, Hithium, Jinko, JA Solar, Atomberg and more.",
      ],
      "Genuine, warranty-backed products sourced through official distribution and authorised-dealer channels.",
      [
        {
          question: "Which brands does Sustech supply?",
          answer:
            "Solar and inverters from Growatt, Jinko and JA Solar; energy storage from Hithium and IE Energy; BLDC fans from Atomberg (sole distributor); plus LED lighting and electrical products — all through official channels.",
        },
        {
          question: "Can Sustech supply products without a full installation?",
          answer:
            "Yes — Sustech supplies and distributes genuine, warranty-backed products on their own, as well as installing them as part of a full EPC scope.",
        },
      ],
    ),
  },
];

// Services whose only change is display order (title/summary left untouched).
const ORDER_ONLY: Record<string, number> = { "training-safety": 11, consultancy: 12 };

async function main(): Promise<void> {
  const payload = await getPayload({ config });

  for (const { base, detail } of NEW_OR_CHANGED) {
    const found = await payload.find({
      collection: "services",
      where: { slug: { equals: base.slug } },
      limit: 1,
    });
    const existing = found.docs[0];
    if (existing) {
      await payload.update({
        collection: "services",
        id: existing.id,
        data: { ...base, ...detail },
      });
      payload.logger.info(`apply-services: updated ${base.slug}.`);
    } else {
      await payload.create({ collection: "services", data: { ...base, ...detail } });
      payload.logger.info(`apply-services: created ${base.slug}.`);
    }
  }

  for (const [slug, order] of Object.entries(ORDER_ONLY)) {
    const found = await payload.find({
      collection: "services",
      where: { slug: { equals: slug } },
      limit: 1,
    });
    const existing = found.docs[0];
    if (existing) {
      await payload.update({ collection: "services", id: existing.id, data: { order } });
    }
  }

  payload.logger.info("apply-services: fans/lighting pillar split applied.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
