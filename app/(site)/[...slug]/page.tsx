import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { RenderBlocks } from "@/components/blocks/render-blocks";
import { JsonLd } from "@/components/seo/json-ld";
import { getPageBySlug, getPublishedPageSlugs, getSiteSettings } from "@/lib/payload";
import { layoutFor, type LayoutSurface } from "@/lib/content-layout";
import { breadcrumbJsonLd, pageMetadata, serverUrl } from "@/lib/seo";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  const slugs = await getPublishedPageSlugs();
  return slugs.filter((s) => s && s !== "home").map((slug) => ({ slug: slug.split("/") }));
}

type Params = { slug: string[] };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const joined = slug.join("/");
  const [page, settings] = await Promise.all([getPageBySlug(joined), getSiteSettings()]);
  return pageMetadata(page, settings, `/${joined}`);
}

export default async function CatchAllPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const joined = slug.join("/");
  const [page, settings] = await Promise.all([getPageBySlug(joined, isEnabled), getSiteSettings()]);
  if (!page) notFound();
  // If this page's slug matches a configured listing surface (e.g. "capabilities"),
  // apply the admin-chosen card layout to its listing blocks. Unknown slugs resolve
  // to "vertical" (the default), so other CMS pages are unaffected.
  const cardLayout = layoutFor(settings, joined as LayoutSurface);

  const pageUrl = `${serverUrl}/${joined}`;
  // Top-level pages get Home › Page breadcrumb; nested paths get each segment.
  const crumbs = [
    { name: "Home", url: serverUrl },
    ...slug.map((segment, i) => ({
      name:
        i === slug.length - 1 && page.title
          ? page.title
          : segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      url: i < slug.length - 1 ? `${serverUrl}/${slug.slice(0, i + 1).join("/")}` : undefined,
    })),
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": pageUrl,
          url: pageUrl,
          name: page.title,
          description: page.seo?.description || undefined,
          inLanguage: "en",
          isPartOf: { "@type": "WebSite", url: serverUrl },
        }}
      />
      <RenderBlocks blocks={page.layout} cardLayout={cardLayout} />
    </>
  );
}
