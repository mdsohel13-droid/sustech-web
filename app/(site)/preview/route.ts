import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

/** Enables Next draft mode (after checking the preview secret) and redirects to the page. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const path = searchParams.get("path") || "/";

  if (!process.env.PREVIEW_SECRET || secret !== process.env.PREVIEW_SECRET) {
    return new Response("Invalid preview token", { status: 401 });
  }
  const dm = await draftMode();
  dm.enable();
  redirect(path.startsWith("/") ? path : `/${path}`);
}
