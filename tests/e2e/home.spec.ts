import { expect, test } from "@playwright/test";

test.describe("CMS-driven site", () => {
  test("home renders from the seeded CMS page with a single h1", async ({ page }) => {
    await page.goto("/");
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText("Single-point EPC for industrial power, solar and safety.");
  });

  test("navigation renders from the Navigation global", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole("button", { name: "Solutions" })).toBeVisible();
    await expect(nav.getByRole("button", { name: "Services" })).toBeVisible();
    await expect(
      page.getByRole("banner").getByRole("link", { name: "Request a Consultation" }),
    ).toBeVisible();
  });

  test("the Solutions mega-menu opens and shows seeded sector links", async ({ page }) => {
    await page.goto("/");
    const header = page.getByRole("banner");
    const trigger = header.getByRole("button", { name: "Solutions" });
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(header.getByRole("link", { name: "Power & Utilities" })).toBeVisible();
  });

  test("the 5th service appears in the Services menu and as a What-we-do card", async ({
    page,
  }) => {
    await page.goto("/");
    const header = page.getByRole("banner");
    await header.getByRole("button", { name: "Services" }).click();
    await expect(
      header.getByRole("link", { name: "Testing, Inspection & Consultancy" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 3, name: "Testing, Inspection & Consultancy" }),
    ).toBeVisible();
  });

  test("the proof bar shows the revised four stats", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Years of engineering")).toBeVisible();
    await expect(page.getByText("Service lines")).toBeVisible();
    await expect(page.getByText("kWp solar installed")).toHaveCount(0);
  });

  test("an unpublished (draft) page returns 404 publicly", async ({ page }) => {
    const res = await page.goto("/careers");
    expect(res?.status()).toBe(404);
  });
});
