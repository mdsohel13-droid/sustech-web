import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { RenderBlocks } from "@/components/blocks/render-blocks";
import { JsonLd } from "@/components/seo/json-ld";
import { getPageBySlug, getSiteSettings } from "@/lib/payload";
import { pageMetadata, siteJsonLd } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPageBySlug("home"), getSiteSettings()]);
  return pageMetadata(page, settings, "/");
}

export default async function HomePage() {
  const { isEnabled } = await draftMode();
  const [page, settings] = await Promise.all([getPageBySlug("home", isEnabled), getSiteSettings()]);
  if (!page) notFound();
  return (
    <>
      <JsonLd data={siteJsonLd(settings)} />
      <RenderBlocks blocks={page.layout} />
    </>
  );
}
