import { expect, test } from "@playwright/test";

test.describe("Footer + partner trust bar", () => {
  test("home shows the partner trust bar", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Our global technology partners")).toBeVisible();
    // Scope to the partner bar section (via its sr-only heading) — partner brand names like
    // "Atomberg" can legitimately appear elsewhere on the page (e.g. the Product Showcase block).
    const partnerBar = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "Technology partners" }) });
    await expect(partnerBar.getByText("Atomberg", { exact: true })).toBeVisible();
    await expect(partnerBar.getByText("Growatt", { exact: true })).toBeVisible();
  });

  test("footer shows certifications and the distributor badge", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByText("RJSC Registered")).toBeVisible();
    await expect(footer.getByText("SREDA Energy Auditor")).toBeVisible();
    await expect(footer.getByText(/Sole distributor: Atomberg/)).toBeVisible();
  });
});
