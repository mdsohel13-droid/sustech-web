import { expect, test } from "@playwright/test";

test.describe("SEO / GEO endpoints", () => {
  test("robots.txt is served (beta = noindex in CI)", async ({ page }) => {
    const res = await page.goto("/robots.txt");
    expect(res?.status()).toBe(200);
    const body = (await res?.text()) ?? "";
    // CI runs with SITE_INDEXABLE=false, so the whole site is disallowed.
    expect(body).toContain("Disallow: /");
  });

  test("sitemap.xml lists published content", async ({ page }) => {
    const res = await page.goto("/sitemap.xml");
    expect(res?.status()).toBe(200);
    const body = (await res?.text()) ?? "";
    expect(body).toContain("<urlset");
    expect(body).toContain("/services/solar-renewable");
    expect(body).toContain("/solutions/garments-rmg");
  });

  test("llms.txt maps the authoritative pages", async ({ page }) => {
    const res = await page.goto("/llms.txt");
    expect(res?.status()).toBe(200);
    const body = (await res?.text()) ?? "";
    expect(body).toContain("# Sustech Technology Ltd");
    expect(body).toContain("/services/solar-renewable");
    expect(body).toContain("## Sectors");
  });

  test("pages carry an Open Graph image (dynamic card or explicit upload)", async ({ page }) => {
    await page.goto("/");
    // Pages now default to a titled, on-brand /api/og card (plan 3·4); an explicit
    // seo.image / settings.ogImage upload — or the static jpg — is also valid.
    await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute(
      "content",
      /\/api\/og\?|og-default\.jpg|\/media\//,
    );
  });

  test("home carries site-wide Organization/LocalBusiness JSON-LD", async ({ page }) => {
    await page.goto("/");
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const joined = blocks.join("\n");
    expect(joined).toContain('"Organization"');
    expect(joined).toContain('"LocalBusiness"');
    expect(joined).toContain('"WebSite"');
  });
});
