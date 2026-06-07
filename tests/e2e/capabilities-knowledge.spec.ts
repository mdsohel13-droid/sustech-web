import { expect, test } from "@playwright/test";

test.describe("Knowledge index", () => {
  test("renders the published articles grid", async ({ page }) => {
    const res = await page.goto("/knowledge");
    expect(res?.status()).toBe(200);
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText("Knowledge Hub");
    // Seeded Tier-1 articles are published.
    await expect(
      page.getByRole("heading", {
        name: "How to Size a Solar System for a Garments Factory in Bangladesh",
      }),
    ).toBeVisible();
  });

  test("an article card links through to the article", async ({ page }) => {
    await page.goto("/knowledge");
    await page
      .getByRole("link", { name: /read article$/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/knowledge\/.+/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("Capabilities page", () => {
  test("renders from the seeded CMS page with one h1", async ({ page }) => {
    const res = await page.goto("/capabilities");
    expect(res?.status()).toBe(200);
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(
      page.getByRole("heading", { name: "Ten service lines, one accountable team." }),
    ).toBeVisible();
  });
});
