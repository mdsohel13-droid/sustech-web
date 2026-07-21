"use server";

/**
 * captureGatedLead — the gated-asset conversion (master plan §3.3). Captures a
 * consented lead (source: "gated-asset") via the shared upsert, then mints a
 * signed 24-hour download URL for the requested resource. n8n also emails the
 * link (Phase 5); the visitor gets it immediately here.
 *
 * Hardening mirrors captureLead: honeypot, per-IP rate limit, length clamps.
 */
import { headers } from "next/headers";
import { serverCapture } from "@/lib/analytics/server";
import { signDownload } from "@/lib/gated-download";
import { isHot, temperatureOf } from "@/lib/leads/scoring";
import { notifyLeadEvent, notifyOwnerLead } from "@/lib/leads/notify";
import { getPayloadClient } from "@/lib/payload";
import { upsertLead } from "@/lib/leads/upsert-lead";
import type { KnowledgeResource } from "@/payload-types";

export interface GatedLeadInput {
  resourceId: number | string;
  name?: string;
  email: string;
  company?: string;
  segment?: string;
  marketingOptIn?: boolean;
  sourcePath?: string;
  utm?: { source?: string; medium?: string; campaign?: string };
  company_website?: string; // honeypot
}

const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX = 10;
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.set(ip, recent);
  if (recent.length >= MAX) return true;
  recent.push(now);
  return false;
}

export async function captureGatedLead(
  input: GatedLeadInput,
): Promise<{ ok: boolean; downloadUrl?: string }> {
  if ((input.company_website ?? "").trim() !== "") return { ok: true }; // honeypot
  if (!input.email?.trim()) return { ok: false };

  const hdrs = await headers();
  const ip = (hdrs.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) return { ok: false };

  // Resolve the resource and confirm it exists.
  const payload = await getPayloadClient();
  let resource: KnowledgeResource | null = null;
  try {
    resource = await payload.findByID({
      collection: "knowledge-resources",
      id: input.resourceId,
      depth: 0,
      overrideAccess: true,
    });
  } catch {
    return { ok: false };
  }
  if (!resource) return { ok: false };

  const result = await upsertLead({
    source: "gated-asset",
    name: input.name,
    email: input.email,
    company: input.company,
    segment: input.segment,
    sourcePath: input.sourcePath,
    marketingOptIn: input.marketingOptIn === true,
    utm: input.utm,
  });
  if (!result) return { ok: false };

  notifyLeadEvent({
    event: result.created ? "lead.created" : "lead.updated",
    email: input.email,
    segment: input.segment,
    source: "gated-asset",
    score: result.score,
    hot: isHot(result.score),
    utm: input.utm,
  });
  notifyOwnerLead({
    leadId: result.id,
    name: input.name,
    email: input.email,
    company: input.company,
    segment: input.segment,
    source: "gated-asset",
    score: result.score,
    temperature: temperatureOf(result.score),
    sourcePath: input.sourcePath,
    utm: input.utm,
  });
  serverCapture("lead_captured", {
    source: "gated-asset",
    segment: input.segment ?? "other",
    score: result.score,
    created: result.created,
  });
  // Which asset actually pulls leads — the lead_captured event alone can't tell
  // us that, and sector lead magnets (plan 3·1) are measured by segment + asset.
  serverCapture("gated_asset_downloaded", {
    asset: resource.slug ?? String(resource.id),
    segment: input.segment ?? "other",
  });

  const token = signDownload(resource.id);
  const downloadUrl = token
    ? `/api/download/${resource.id}?t=${encodeURIComponent(token)}`
    : undefined;
  return { ok: true, downloadUrl };
}
