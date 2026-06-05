import { getSectors, getServices, getSiteSettings } from "@/lib/payload";
import { serverUrl } from "@/lib/seo";

export const revalidate = 3600;

/**
 * /llms.txt — a clean Markdown map of the site's authoritative pages for LLMs
 * and AI agents (GEO/AEO). Generated from the CMS so it stays current.
 */
export async function GET(): Promise<Response> {
  const [settings, services, sectors] = await Promise.all([
    getSiteSettings(),
    getServices(),
    getSectors(),
  ]);

  const lines: string[] = [`# ${settings.companyName ?? "Sustech Technology Ltd"}`, ""];
  if (settings.description) lines.push(`> ${settings.description}`, "");

  lines.push(
    "## Core pages",
    `- [Home](${serverUrl}/): single-point EPC for industrial power, solar and safety.`,
    `- [Capabilities](${serverUrl}/capabilities): full engineering capability overview.`,
    `- [Projects](${serverUrl}/projects): delivered case studies.`,
    `- [Knowledge](${serverUrl}/knowledge): engineering notes and guides.`,
    `- [Request a Consultation](${serverUrl}/request-quote): scope a project with an engineer.`,
    `- [Contact](${serverUrl}/contact): ways to reach the team.`,
    "",
    "## Services",
    ...services.map((s) => `- [${s.title}](${serverUrl}/services/${s.slug}): ${s.summary}`),
    "",
    "## Sectors",
    ...sectors.map((s) => `- [${s.title}](${serverUrl}/solutions/${s.slug}): ${s.summary}`),
    "",
  );

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
