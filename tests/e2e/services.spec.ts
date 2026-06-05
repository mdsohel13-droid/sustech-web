import { expect, test } from "@playwright/test";

test.describe("Service detail pages", () => {
  test("a seeded service renders with one h1 and its content", async ({ page }) => {
    const res = await page.goto("/services/solar-renewable");
    expect(res?.status()).toBe(200);
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText("Solar & Renewable Energy");
    // Scope + FAQ seeded content is server-rendered.
    await expect(page.getByRole("heading", { name: "What's included" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Frequently asked questions" })).toBeVisible();
  });

  test("an unknown service slug returns 404", async ({ page }) => {
    const res = await page.goto("/services/not-a-real-service");
    expect(res?.status()).toBe(404);
  });
});
