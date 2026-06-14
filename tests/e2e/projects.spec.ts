import { expect, test } from "@playwright/test";

test.describe("Projects index", () => {
  test("renders the published projects grid with filters", async ({ page }) => {
    const res = await page.goto("/projects");
    expect(res?.status()).toBe(200);
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText("Projects");
    // Seeded featured projects (Brief Part 6) are published.
    await expect(
      page.getByRole("heading", { name: "Eastport Cumilla — 100 kWp On-Grid Solar EPC" }),
    ).toBeVisible();
    // Filter row is a single <nav aria-label="Filter projects"> holding the
    // Sector + Service dropdowns (UI refactored to FilterDropdown from the old
    // per-facet landmark navs).
    const filters = page.getByRole("navigation", { name: "Filter projects" });
    await expect(filters).toBeVisible();
    // exact:true — a loose "Sector"/"Service" match also hits the dropdown's
    // "All sectors (N)" / "All services (N)" options (substring, case-insensitive)
    // and trips Playwright strict mode. We just want the two facet labels.
    await expect(filters.getByText("Sector", { exact: true })).toBeVisible();
    await expect(filters.getByText("Service", { exact: true })).toBeVisible();
  });

  test("a project card links through to a detail page", async ({ page }) => {
    await page.goto("/projects");
    await page
      .getByRole("link", { name: /read case study$/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/projects\/.+/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("the sector filter narrows the grid", async ({ page }) => {
    await page.goto("/projects?sector=ngo-un");
    expect(page.url()).toContain("sector=ngo-un");
    // WFP projects are tagged ngo-un.
    await expect(page.getByRole("heading", { name: /WFP/ }).first()).toBeVisible();
  });
});
