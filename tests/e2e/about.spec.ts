import { expect, test } from "@playwright/test";

test.describe("About page", () => {
  test("is published and renders story, team and certifications", async ({ page }) => {
    const res = await page.goto("/about");
    expect(res?.status()).toBe(200);
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "Our story" })).toBeVisible();
    // Team grid is populated from the Team collection.
    await expect(page.getByRole("heading", { name: "Md. Sohel Sikder" })).toBeVisible();
    await expect(page.getByText("Managing Director & Founder")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Certifications & credentials" })).toBeVisible();
  });
});
