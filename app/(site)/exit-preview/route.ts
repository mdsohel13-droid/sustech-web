import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dm = await draftMode();
  dm.disable();
  // Guard against open redirect: only allow relative paths starting with a
  // single slash (disallow protocol-relative //evil.com URLs).
  const raw = searchParams.get("path") ?? "/";
  const dest = /^\/(?!\/)/.test(raw) ? raw : "/";
  redirect(dest);
}
