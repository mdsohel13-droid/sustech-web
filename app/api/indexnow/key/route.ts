/**
 * IndexNow key verification endpoint. Search engines fetch this (referenced as
 * `keyLocation` in every submission) and confirm it returns exactly the key,
 * proving we own the host. 404s when IndexNow isn't configured.
 */
import { NextResponse } from "next/server";
import { indexNowKey } from "@/lib/indexnow";

export const runtime = "nodejs";

export function GET() {
  const key = indexNowKey();
  if (!key) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(key, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=86400",
    },
  });
}
