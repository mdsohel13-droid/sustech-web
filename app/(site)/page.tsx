import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { RenderBlocks } from "@/components/blocks/render-blocks";
import { getPageBySlug, getSiteSettings } from "@/lib/payload";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  // Use the same draft flag in metadata so preview mode shows consistent data.
  const { isEnabled } = await draftMode();
  const [page, settings] = await Promise.all([getPageBySlug("home", isEnabled), getSiteSettings()]);
  return pageMetadata(page, settings, "/");
}

export default async function HomePage() {
  const { isEnabled } = await draftMode();
  const [page] = await Promise.all([getPageBySlug("home", isEnabled)]);
  if (!page) notFound();
  // JsonLd for Organization is already emitted by the site layout — no duplicate here.
  return <RenderBlocks blocks={page.layout} />;
}
