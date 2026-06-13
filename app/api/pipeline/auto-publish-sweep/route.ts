/**
 * POST /api/pipeline/auto-publish-sweep (PIPELINE_SECRET). Runs hourly. For each
 * PENDING draft it evaluates the auto-publish policy (lib/auto-publish-policy)
 * and publishes — via the one guarded path — only when EVERY gate holds.
 *
 * Shadow mode: while AUTO_PUBLISH_ENABLED is off (the ship default), it never
 * publishes; it reports what it WOULD publish if the switches were on, so the
 * owner can watch ≥2 weeks of logs before enabling. The claim-diff veto,
 * category whitelist, risk flags, stale-source exclusion and daily cap are all
 * evaluated regardless, so the shadow signal is trustworthy.
 */
import { NextResponse } from "next/server";
import {
  canAutoPublish,
  parseAllowedCategories,
  type AutoPublishContext,
} from "@/lib/auto-publish-policy";
import { diffClaims, type Claim } from "@/lib/claim-diff";
import { hasSecret } from "@/lib/pipeline-auth";
import { getPayloadClient } from "@/lib/payload";
import { publishViaGuard, type GuardCollection } from "@/lib/publish-guard";

export const runtime = "nodejs";

interface DocState {
  collection: GuardCollection;
  id: string | number;
  title: string;
  category?: string | null;
  draftClaims: Claim[];
  publishedClaims: Claim[];
  riskFlags: string[];
  pendingSince: string | null;
  staleSource: boolean;
}

async function pendingDocs(): Promise<DocState[]> {
  const payload = await getPayloadClient();
  const out: DocState[] = [];
  for (const collection of ["articles", "news-items"] as const) {
    const res = await payload.find({
      collection,
      where: { "revisionMeta.approvalState": { equals: "pending" } },
      draft: true,
      depth: 0,
      limit: 100,
      overrideAccess: true,
    });
    for (const d of res.docs) {
      // Live published claims (no draft) for the byte-identity veto.
      let publishedClaims: Claim[] = [];
      try {
        const pub = await payload.findByID({
          collection,
          id: d.id,
          depth: 0,
          overrideAccess: true,
        });
        publishedClaims = ((pub as { claims?: Claim[] }).claims ?? []) as Claim[];
      } catch {
        publishedClaims = [];
      }
      const rm = (d as { revisionMeta?: Record<string, unknown> }).revisionMeta ?? {};
      out.push({
        collection,
        id: d.id,
        title: (d as { title?: string }).title ?? "(untitled)",
        category: (d as { category?: string | null }).category,
        draftClaims: ((d as { claims?: Claim[] }).claims ?? []) as Claim[],
        publishedClaims,
        riskFlags: (rm.riskFlags as string[]) ?? [],
        pendingSince: (rm.pendingSince as string) ?? null,
        staleSource: Boolean(rm.staleSource),
      });
    }
  }
  return out;
}

async function todayAutoCount(): Promise<number> {
  const payload = await getPayloadClient();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const res = await payload.find({
    collection: "publish-audit",
    where: {
      and: [
        { action: { equals: "auto-published-24h" } },
        { at: { greater_than_equal: start.toISOString() } },
      ],
    },
    limit: 0,
    overrideAccess: true,
  });
  return res.totalDocs;
}

async function dbAutoEnabled(): Promise<boolean> {
  try {
    const payload = await getPayloadClient();
    const g = await payload.findGlobal({ slug: "automation-settings", depth: 0 });
    return Boolean((g as { autoPublishEnabled?: boolean }).autoPublishEnabled);
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  if (!hasSecret(req, "PIPELINE_SECRET")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const envEnabled = process.env.AUTO_PUBLISH_ENABLED === "true";
  const killSwitch = process.env.AUTOMATION_KILL_SWITCH === "true";
  const allowedCategories = parseAllowedCategories(process.env.AUTO_PUBLISH_CATEGORIES);
  const afterHours = Number(process.env.AUTO_PUBLISH_AFTER_HOURS ?? 24);
  const dailyCap = Number(process.env.AUTO_PUBLISH_DAILY_CAP ?? 5);
  const dbEnabled = await dbAutoEnabled();

  const docs = await pendingDocs();
  let todayCount = await todayAutoCount();
  const now = Date.now();

  const published: string[] = [];
  const wouldPublish: string[] = [];
  const denied: { id: string; title: string; reasons: string[] }[] = [];

  for (const d of docs) {
    const claimsIdentical = diffClaims(d.publishedClaims, d.draftClaims).identical;
    const baseCtx: AutoPublishContext = {
      envEnabled,
      dbEnabled,
      killSwitch,
      pendingSinceMs: d.pendingSince ? new Date(d.pendingSince).getTime() : null,
      nowMs: now,
      afterHours,
      category: d.category,
      allowedCategories,
      riskFlags: d.riskFlags,
      claimsIdentical,
      staleSource: d.staleSource,
      todayCount,
      dailyCap,
    };

    const decision = canAutoPublish(baseCtx);
    if (decision.allow) {
      const r = await publishViaGuard({
        collection: d.collection,
        docId: d.id,
        actor: "pipeline",
        action: "auto-published-24h",
        claimDiffSnapshot: { claimsIdentical: true },
      });
      if (r.ok) {
        published.push(`${d.collection}:${d.id}`);
        todayCount += 1;
      } else {
        denied.push({
          id: `${d.collection}:${d.id}`,
          title: d.title,
          reasons: [r.error ?? "publish-failed"],
        });
      }
      continue;
    }

    // Shadow signal: would it publish if the master switches were on?
    const shadow = canAutoPublish({ ...baseCtx, envEnabled: true, dbEnabled: true });
    if (shadow.allow) wouldPublish.push(`${d.collection}:${d.id}`);
    else denied.push({ id: `${d.collection}:${d.id}`, title: d.title, reasons: decision.reasons });
  }

  return NextResponse.json({
    mode: envEnabled && dbEnabled && !killSwitch ? "live" : "shadow",
    evaluated: docs.length,
    published,
    wouldPublish,
    denied,
    todayCount,
  });
}
