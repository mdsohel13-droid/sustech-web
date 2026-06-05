import { expect, test } from "@playwright/test";

test.describe("Knowledge index", () => {
  test("renders a single h1 and a grid or empty state", async ({ page }) => {
    const res = await page.goto("/knowledge");
    expect(res?.status()).toBe(200);
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText("Knowledge");
    const cards = page.getByRole("link", { name: /read article$/ });
    const empty = page.getByText(/Articles are on the way/);
    expect((await cards.count()) + (await empty.count())).toBeGreaterThan(0);
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
