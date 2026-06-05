import { expect, test } from "@playwright/test";

test.describe("Contact page", () => {
  test("renders with one h1 and routes to the RFQ form", async ({ page }) => {
    const res = await page.goto("/contact");
    expect(res?.status()).toBe(200);
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText("Contact us");
    await expect(page.getByRole("heading", { name: "Ways to reach us" })).toBeVisible();
    await expect(page.locator('a[href="/request-quote"]').first()).toBeVisible();
  });
});
