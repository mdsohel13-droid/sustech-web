import { describe, expect, it } from "vitest";
import {
  checkMediaAlt,
  checkSectorFunnel,
  checkSeoDescription,
  summarise,
} from "@/lib/content-health";

describe("content-health checks", () => {
  it("flags media with blank/whitespace/missing alt only", () => {
    const issues = checkMediaAlt([
      { id: 1, alt: "A busbar trunking panel", filename: "a.jpg" },
      { id: 2, alt: "", filename: "b.jpg" },
      { id: 3, alt: null, filename: "c.jpg" },
      { id: 4, alt: "   ", filename: "d.jpg" },
    ]);
    expect(issues.map((i) => i.id)).toEqual([2, 3, 4]);
    expect(issues[0]?.problem).toBe("missing alt text");
    expect(issues[0]?.path).toBe("/admin/collections/media/2");
  });

  it("flags only PUBLISHED docs missing an SEO description", () => {
    const issues = checkSeoDescription(
      "services",
      [
        { id: 1, slug: "solar", title: "Solar", seo: { description: "We do solar." } },
        { id: 2, slug: "lps", title: "LPS", seo: { description: "" } },
        { id: 3, slug: "hv", title: "HV", _status: "draft", seo: { description: "" } }, // draft → ignored
        { id: 4, slug: "earthing", title: "Earthing", seo: null },
      ],
      (s) => `/services/${s}`,
    );
    expect(issues.map((i) => i.id)).toEqual([2, 4]);
    expect(issues[0]?.path).toBe("/services/lps");
  });

  it("flags sectors with any missing funnel piece and names the gaps", () => {
    const issues = checkSectorFunnel([
      { id: 1, slug: "rmg", title: "RMG", proofStats: [{}], faqs: [{}], leadMagnet: 5 },
      { id: 2, slug: "gov", title: "Government", proofStats: [], faqs: [{}], leadMagnet: null },
    ]);
    expect(issues).toHaveLength(1);
    expect(issues[0]?.title).toBe("Government");
    expect(issues[0]?.problem).toContain("proof figures");
    expect(issues[0]?.problem).toContain("lead magnet");
    expect(issues[0]?.problem).not.toContain("FAQ");
  });

  it("summarise groups by problem prefix", () => {
    const report = summarise([
      { collection: "media", id: 1, title: "a", path: "/x", problem: "missing alt text" },
      { collection: "media", id: 2, title: "b", path: "/y", problem: "missing alt text" },
      {
        collection: "sectors",
        id: 3,
        title: "c",
        path: "/z",
        problem: "sector funnel incomplete: no FAQ",
      },
    ]);
    expect(report.total).toBe(3);
    expect(report.byProblem["missing alt text"]).toBe(2);
    expect(report.byProblem["sector funnel incomplete"]).toBe(1);
  });
});
