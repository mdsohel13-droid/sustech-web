/**
 * /api/approve (Lead Engine master plan §3.2c). One-click approve/reject from
 * the owner's email.
 *
 *  GET  → renders a confirm PAGE with a single POST button. A mail-scanner that
 *         prefetches the GET link can therefore never publish anything.
 *  POST → verifies the token again, enforces single-use (jti) + version-pin
 *         (the draft must be unchanged since the email), then publishes via the
 *         guard (approve) or marks rejected. Owner action only.
 *
 * The token (lib/approval-token) carries { docId, collection, versionId, action,
 * jti, exp }. versionId is the draft's updatedAt at send time → approving after
 * a newer edit fails with "content changed — re-review".
 */
import { type NextRequest, NextResponse } from "next/server";
import { verifyApproval } from "@/lib/approval-token";
import { getPayloadClient } from "@/lib/payload";
import {
  jtiAlreadyUsed,
  publishViaGuard,
  writeAudit,
  type GuardCollection,
} from "@/lib/publish-guard";

export const runtime = "nodejs";

function page(title: string, body: string, status = 200) {
  return new NextResponse(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${title}</title>
    <style>body{font:16px/1.5 system-ui,sans-serif;max-width:34rem;margin:3rem auto;padding:0 1.25rem;color:#0B1B2B}
    .card{border:1px solid #e2e8f0;border-radius:14px;padding:1.5rem}
    .muted{color:#556}.btn{appearance:none;border:0;border-radius:10px;padding:.7rem 1.1rem;font-weight:600;font-size:1rem;cursor:pointer}
    .ok{background:#0073CF;color:#fff}.no{background:#E4572E;color:#fff}.diff{background:#f5f7fa;border-radius:8px;padding:.75rem;font:13px/1.4 ui-monospace,monospace;white-space:pre-wrap}</style>
    </head><body><div class="card">${body}</div></body></html>`,
    {
      status,
      headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex,nofollow" },
    },
  );
}

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token");
  const claims = verifyApproval(token);
  if (!claims)
    return page(
      "Link expired",
      `<h1>Link invalid or expired</h1><p class="muted">Please use the latest approval email, or review at <a href="/review">/review</a>.</p>`,
      410,
    );

  const payload = await getPayloadClient();
  let title = "(untitled)";
  let summary = "";
  try {
    const doc = await payload.findByID({
      collection: claims.collection,
      id: claims.docId,
      draft: true,
      depth: 0,
      overrideAccess: true,
    });
    title = (doc as { title?: string }).title ?? title;
    summary =
      (doc as { revisionMeta?: { changeSummary?: string } }).revisionMeta?.changeSummary ?? "";
  } catch {
    return page("Not found", `<h1>Content not found</h1>`, 404);
  }

  const verb = claims.action === "reject" ? "Reject" : "Approve & publish";
  const cls = claims.action === "reject" ? "no" : "ok";
  return page(
    verb,
    `<h1>${verb}?</h1>
     <p><strong>${escapeHtml(title)}</strong> <span class="muted">(${claims.collection})</span></p>
     ${summary ? `<p class="muted">What changed:</p><div class="diff">${escapeHtml(summary)}</div>` : ""}
     <form method="POST" action="/api/approve?token=${encodeURIComponent(token!)}" style="margin-top:1.25rem">
       <button class="btn ${cls}" type="submit">${verb}</button>
     </form>
     <p class="muted" style="margin-top:1rem"><a href="/api/approve/preview?token=${encodeURIComponent(token!)}">Preview the draft first →</a></p>`,
  );
}

export async function POST(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token");
  const claims = verifyApproval(token);
  if (!claims) return page("Link expired", `<h1>Link invalid or expired</h1>`, 410);

  // Single-use: jti recorded in the immutable audit on first use.
  if (await jtiAlreadyUsed(claims.jti)) {
    return page(
      "Already actioned",
      `<h1>Already actioned</h1><p class="muted">This link was already used. See <a href="/review">/review</a>.</p>`,
      409,
    );
  }

  // Version pin: the draft must be unchanged since the email was sent.
  const payload = await getPayloadClient();
  let doc: { updatedAt?: string } | null = null;
  try {
    const found = await payload.findByID({
      collection: claims.collection,
      id: claims.docId,
      draft: true,
      depth: 0,
      overrideAccess: true,
    });
    doc = found as unknown as { updatedAt?: string };
  } catch {
    return page("Not found", `<h1>Content not found</h1>`, 404);
  }
  if (!doc) return page("Not found", `<h1>Content not found</h1>`, 404);
  if (claims.versionId && doc.updatedAt && String(doc.updatedAt) !== String(claims.versionId)) {
    return page(
      "Content changed",
      `<h1>Content changed — re-review</h1><p class="muted">A newer draft exists. Review the current version at <a href="/review">/review</a>.</p>`,
      409,
    );
  }

  if (claims.action === "reject") {
    try {
      await payload.update({
        collection: claims.collection,
        id: claims.docId,
        draft: true,
        overrideAccess: true,
        data: {
          revisionMeta: {
            approvalState: "rejected",
            decidedBy: "owner",
            decidedAt: new Date().toISOString(),
          },
        } as never,
      });
    } catch {
      /* fall through to audit + message */
    }
    await writeAudit({
      action: "rejected",
      docCollection: claims.collection,
      docId: claims.docId,
      actor: "owner",
      tokenJti: claims.jti,
    });
    return page(
      "Rejected",
      `<h1>Rejected ✓</h1><p class="muted">The draft was not published. It stays at <a href="/review">/review</a> for editing.</p>`,
    );
  }

  const result = await publishViaGuard({
    collection: claims.collection as GuardCollection,
    docId: claims.docId,
    actor: "owner",
    action: "approved-by-owner",
    tokenJti: claims.jti,
  });
  if (!result.ok)
    return page(
      "Error",
      `<h1>Could not publish</h1><p class="muted">${escapeHtml(result.error ?? "Unknown error")}. Try <a href="/review">/review</a>.</p>`,
      500,
    );
  return page(
    "Published",
    `<h1>Published ✓</h1><p class="muted">The update is live. Thank you.</p>`,
  );
}

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
