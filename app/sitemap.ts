import type { MetadataRoute } from "next";
import {
  getArticles,
  getProjects,
  getPublishedPageSlugs,
  getSectors,
  getServices,
} from "@/lib/payload";
import { serverUrl } from "@/lib/seo";

export const revalidate = 3600;

const lastMod = (v: unknown): Date | undefined => {
  if (typeof v !== "string") return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pageSlugs, services, sectors, projects, articles] = await Promise.all([
    getPublishedPageSlugs(),
    getServices(),
    getSectors(),
    getProjects(),
    getArticles(),
  ]);

  const url = (path: string) => `${serverUrl}${path}`;

  const fixed: MetadataRoute.Sitemap = [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/projects"), changeFrequency: "weekly", priority: 0.8 },
    { url: url("/knowledge"), changeFrequency: "weekly", priority: 0.6 },
    { url: url("/request-quote"), changeFrequency: "yearly", priority: 0.9 },
    { url: url("/contact"), changeFrequency: "yearly", priority: 0.5 },
  ];

  // Published CMS pages (capabilities, about-when-published, etc.) — skip home (already above).
  const pages: MetadataRoute.Sitemap = pageSlugs
    .filter((s) => s && s !== "home")
    .map((slug) => ({ url: url(`/${slug}`), changeFrequency: "monthly", priority: 0.6 }));

  const serviceUrls: MetadataRoute.Sitemap = services.map((s) => ({
    url: url(`/services/${s.slug}`),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const sectorUrls: MetadataRoute.Sitemap = sectors.map((s) => ({
    url: url(`/solutions/${s.slug}`),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const projectUrls: MetadataRoute.Sitemap = projects.map((p) => ({
    url: url(`/projects/${p.slug}`),
    lastModified: lastMod(p.updatedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const articleUrls: MetadataRoute.Sitemap = articles.map((a) => ({
    url: url(`/knowledge/${a.slug}`),
    lastModified: lastMod(a.updatedAt),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...fixed, ...pages, ...serviceUrls, ...sectorUrls, ...projectUrls, ...articleUrls];
}
