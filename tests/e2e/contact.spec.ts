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
    // Populated from Settings (Part 1 of the brief). Scope to <main> so the footer's
    // contact links don't cause a strict-mode match.
    const main = page.getByRole("main");
    await expect(main.getByText("+880 1867 655 599")).toBeVisible();
    await expect(main.locator('a[href="mailto:info@sustechltd.com"]')).toBeVisible();
  });
});
