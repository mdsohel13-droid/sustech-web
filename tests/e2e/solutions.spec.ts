import { expect, test } from "@playwright/test";

test.describe("Sector (solutions) detail pages", () => {
  test("a seeded sector renders with one h1, challenges and capabilities", async ({ page }) => {
    const res = await page.goto("/solutions/garments-rmg");
    expect(res?.status()).toBe(200);
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText("Garments & RMG");
    await expect(page.getByRole("heading", { name: "Challenges we solve" })).toBeVisible();
    // Relevant services link through to the service detail pages.
    await expect(page.locator('a[href="/services/electrical-epc"]').first()).toBeVisible();
    // The sector links into the projects filter.
    await expect(page.locator('a[href="/projects?sector=garments-rmg"]').first()).toBeVisible();
  });

  test("an unknown sector slug returns 404", async ({ page }) => {
    const res = await page.goto("/solutions/not-a-real-sector");
    expect(res?.status()).toBe(404);
  });
});
