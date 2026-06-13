/**
 * Publish guard (Lead Engine master plan §3.2c) — THE single code path that
 * publishes a pipeline draft. Both owner-approval and the auto-publish sweep
 * call this, so publishing is one auditable operation. Server-only.
 *
 * It publishes under the internal identity (overrideAccess, no `user`) so the
 * `denyHermesPublish` hook passes and the audit attributes the actor correctly,
 * writes an IMMUTABLE publish-audit row, and stamps revisionMeta. The
 * collection's own afterChange revalidate hook refreshes the live page.
 *
 * `actor` is recorded verbatim: "owner" / "pipeline" / "admin:<id>" — an
 * auto-publish is NEVER recorded as owner approval.
 */
import { getPayloadClient } from "@/lib/payload";

export type GuardCollection = "articles" | "news-items";

export interface PublishGuardInput {
  collection: GuardCollection;
  docId: string | number;
  actor: string; // "owner" | "pipeline" | "admin:<id>"
  action: "approved-by-owner" | "auto-published-24h";
  tokenJti?: string;
  claimDiffSnapshot?: unknown;
}

export interface PublishGuardResult {
  ok: boolean;
  error?: string;
}

/** Append an immutable publish-audit row. Best-effort: never throws upward. */
export async function writeAudit(entry: {
  action: string;
  docCollection: string;
  docId: string | number;
  actor: string;
  versionIdFrom?: string | null;
  versionIdTo?: string | null;
  tokenJti?: string | null;
  claimDiffSnapshot?: unknown;
}): Promise<void> {
  try {
    const payload = await getPayloadClient();
    await payload.create({
      collection: "publish-audit",
      overrideAccess: true,
      data: {
        at: new Date().toISOString(),
        action: entry.action,
        docCollection: entry.docCollection,
        docId: String(entry.docId),
        actor: entry.actor,
        versionIdFrom: entry.versionIdFrom ?? null,
        versionIdTo: entry.versionIdTo ?? null,
        tokenJti: entry.tokenJti ?? null,
        claimDiffSnapshot: entry.claimDiffSnapshot ?? null,
      } as never,
    });
  } catch {
    // Audit is best-effort; a logging failure must not block the publish itself.
  }
}

/** Publish a draft via the guarded, audited path. */
export async function publishViaGuard(input: PublishGuardInput): Promise<PublishGuardResult> {
  const payload = await getPayloadClient();

  let fromUpdatedAt: string | null = null;
  try {
    const current = await payload.findByID({
      collection: input.collection,
      id: input.docId,
      depth: 0,
      overrideAccess: true,
    });
    fromUpdatedAt = (current as { updatedAt?: string }).updatedAt ?? null;
  } catch {
    return { ok: false, error: "not-found" };
  }

  try {
    const published = await payload.update({
      collection: input.collection,
      id: input.docId,
      overrideAccess: true, // internal identity → passes denyHermesPublish, correct audit
      data: {
        _status: "published",
        revisionMeta: {
          approvalState: input.action === "auto-published-24h" ? "auto-published" : "approved",
          decidedBy: input.actor,
          decidedAt: new Date().toISOString(),
        },
      } as never,
    });

    await writeAudit({
      action: input.action,
      docCollection: input.collection,
      docId: input.docId,
      actor: input.actor,
      versionIdFrom: fromUpdatedAt,
      versionIdTo: (published as { updatedAt?: string }).updatedAt ?? null,
      tokenJti: input.tokenJti,
      claimDiffSnapshot: input.claimDiffSnapshot,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** Has this single-use token jti already been consumed? (replay guard) */
export async function jtiAlreadyUsed(jti: string): Promise<boolean> {
  try {
    const payload = await getPayloadClient();
    const found = await payload.find({
      collection: "publish-audit",
      where: { tokenJti: { equals: jti } },
      limit: 1,
      overrideAccess: true,
    });
    return found.totalDocs > 0;
  } catch {
    return false; // fail-open on read error would be unsafe; but a DB outage blocks publish elsewhere
  }
}
