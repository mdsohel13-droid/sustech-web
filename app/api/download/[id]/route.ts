/**
 * GET /api/download/[id]?t=<token> — gated-asset delivery (master plan §3.3).
 * Verifies the signed 24-hour token, loads the knowledge-resource, and redirects
 * to the real file URL. The web tier never streams the file; the gate is the
 * captured lead, not DRM. noindex by header.
 */
import { type NextRequest, NextResponse } from "next/server";
import { verifyDownload } from "@/lib/gated-download";
import { getPayloadClient } from "@/lib/payload";
import type { KnowledgeResource, Media } from "@/payload-types";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

function deny(status: number, msg: string) {
  return new NextResponse(msg, {
    status,
    headers: { "X-Robots-Tag": "noindex, nofollow", "Content-Type": "text/plain" },
  });
}

export async function GET(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const token = new URL(req.url).searchParams.get("t");
  if (!verifyDownload(id, token)) {
    return deny(403, "This download link is invalid or has expired. Please request it again.");
  }

  let resource: KnowledgeResource | null = null;
  try {
    const payload = await getPayloadClient();
    resource = await payload.findByID({
      collection: "knowledge-resources",
      id,
      depth: 1,
      overrideAccess: true,
    });
  } catch {
    return deny(404, "Not found.");
  }
  if (!resource) return deny(404, "Not found.");

  const upload =
    resource.fileUpload && typeof resource.fileUpload === "object"
      ? (resource.fileUpload as Media).url
      : null;
  const target = upload || resource.fileUrl || null;
  if (!target) return deny(404, "This asset has no file attached yet.");

  return NextResponse.redirect(new URL(target, req.url), {
    status: 302,
    headers: { "X-Robots-Tag": "noindex, nofollow" },
  });
}
