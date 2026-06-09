import type { SiteSetting } from "@/payload-types";

/**
 * Resolve the admin-chosen card layout for a listing surface.
 *
 * Layout rules live in Site Settings → Display → "Content listing layouts" (an
 * editable array of { surface, style }). A surface with no rule falls back to
 * the default vertical grid. This is the single source of truth read by every
 * listing page, so the layout is fully CMS-driven — no per-page hardcoding.
 */
export type CardStyle = "vertical" | "horizontal";

/** Surface keys must match the values in LAYOUT_SURFACES (cms/globals/site-settings.ts). */
export type LayoutSurface = NonNullable<
  NonNullable<SiteSetting["contentLayouts"]>[number]["surface"]
>;

export function layoutFor(
  settings: Pick<SiteSetting, "contentLayouts">,
  surface: LayoutSurface,
): CardStyle {
  const rule = (settings.contentLayouts ?? []).find((r) => r?.surface === surface);
  return rule?.style === "horizontal" ? "horizontal" : "vertical";
}

/** Convenience: true when the surface is set to horizontal hover-reveal rows. */
export function isHorizontal(
  settings: Pick<SiteSetting, "contentLayouts">,
  surface: LayoutSurface,
): boolean {
  return layoutFor(settings, surface) === "horizontal";
}
