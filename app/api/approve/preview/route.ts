/**
 * /api/approve/preview (Lead Engine master plan §3.2c). Lets the owner view the
 * pending DRAFT on the live site from the approval email, gated by the same
 * signed approval token — so the raw PREVIEW_SECRET never travels in email.
 * Enables Next draft mode, then redirects to the doc's public URL.
 */
import { type NextRequest, NextResponse } from "next/server";
import { draftMode } from "next/headers";
import { verifyApproval } from "@/lib/approval-token";
import { getPayloadClient } from "@/lib/payload";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token");
  const claims = verifyApproval(token);
  if (!claims) {
    return new NextResponse("Preview link invalid or expired.", {
      status: 410,
      headers: { "X-Robots-Tag": "noindex,nofollow" },
    });
  }

  let slug = "";
  try {
    const payload = await getPayloadClient();
    const doc = await payload.findByID({
      collection: claims.collection,
      id: claims.docId,
      draft: true,
      depth: 0,
      overrideAccess: true,
    });
    slug = (doc as { slug?: string }).slug ?? "";
  } catch {
    return new NextResponse("Content not found.", { status: 404 });
  }
  if (!slug) return new NextResponse("Content not found.", { status: 404 });

  const base = claims.collection === "news-items" ? "/news" : "/knowledge";
  (await draftMode()).enable();
  return NextResponse.redirect(new URL(`${base}/${slug}`, req.url), {
    status: 302,
    headers: { "X-Robots-Tag": "noindex,nofollow" },
  });
}
