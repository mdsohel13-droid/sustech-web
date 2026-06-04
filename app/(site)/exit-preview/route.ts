import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dm = await draftMode();
  dm.disable();
  redirect(searchParams.get("path") || "/");
}
