import type { SiteSetting } from "@/payload-types";

/**
 * CMS overrides for index-page hero copy (eyebrow / heading / lede).
 *
 * A page reads its intro and falls back to its built-in default for any field
 * the admin left blank, so this is purely additive — no page breaks if the CMS
 * has no intro row. Managed in Site Settings → Page intros.
 */
export type IntroPage = NonNullable<NonNullable<SiteSetting["pageIntros"]>[number]["page"]>;

export type PageIntro = {
  eyebrow: string | null;
  heading: string | null;
  lede: string | null;
};

export function pageIntro(settings: Pick<SiteSetting, "pageIntros">, page: IntroPage): PageIntro {
  const row = (settings.pageIntros ?? []).find((r) => r?.page === page);
  return {
    eyebrow: row?.eyebrow?.trim() || null,
    heading: row?.heading?.trim() || null,
    lede: row?.lede?.trim() || null,
  };
}
