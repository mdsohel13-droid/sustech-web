/**
 * Canonical lead upsert (master plan §3.3 / Phase 1). Every capture path —
 * RFQ hook, chat, calculators, gated assets, the GrowthOS promotion door —
 * funnels through here so dedupe, merge, scoring and the touch timeline stay
 * consistent regardless of entry point.
 *
 * Dedupe key: lowercased email (unique index); falls back to phone when the
 * touch has no email. All merge rules live in the PURE module
 * `lib/leads/merge.ts` (unit-tested without a DB); this file is only the
 * thin persistence wrapper. Server-only.
 */
import { getPayloadClient } from "@/lib/payload";
import type { Lead } from "@/payload-types";
import { mergeLead, sanitizeTouch, type LeadData, type LeadTouch } from "./merge";

export type { LeadTouch } from "./merge";

export interface UpsertResult {
  id: number | string;
  score: number;
  created: boolean;
}

/** Find-by-email/phone, merge, persist. */
export async function upsertLead(rawTouch: LeadTouch): Promise<UpsertResult | null> {
  const t = sanitizeTouch(rawTouch);
  if (!t.email && !t.phone) return null; // nothing identifiable — not a lead

  const payload = await getPayloadClient();

  const where: import("payload").Where = t.email
    ? { email: { equals: t.email } }
    : { phone: { equals: t.phone as string } };
  const found = await payload.find({
    collection: "leads",
    where,
    limit: 1,
    overrideAccess: true,
  });
  const existing = (found.docs[0] as Lead | undefined) ?? null;

  const data = mergeLead(existing, t, new Date());

  if (existing) {
    await payload.update({
      collection: "leads",
      id: existing.id,
      data,
      overrideAccess: true,
    });
    return { id: existing.id, score: data.score ?? 0, created: false };
  }

  const createdDoc = await payload.create({
    collection: "leads",
    data: data as Required<Pick<LeadData, "source">> & LeadData,
    overrideAccess: true,
  });
  return { id: createdDoc.id, score: data.score ?? 0, created: true };
}
