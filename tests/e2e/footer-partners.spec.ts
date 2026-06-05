import { expect, test } from "@playwright/test";

test.describe("Footer + partner trust bar", () => {
  test("home shows the partner trust bar", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Our global technology partners")).toBeVisible();
    await expect(page.getByRole("main").getByText("Atomberg", { exact: true })).toBeVisible();
    await expect(page.getByRole("main").getByText("Growatt", { exact: true })).toBeVisible();
  });

  test("footer shows certifications and the distributor badge", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByText("RJSC Registered")).toBeVisible();
    await expect(footer.getByText("SREDA Energy Auditor")).toBeVisible();
    await expect(footer.getByText(/Sole distributor: Atomberg/)).toBeVisible();
  });
});
