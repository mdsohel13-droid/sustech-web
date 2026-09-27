/**
 * Minimal Lexical + link builders shared by the CMS seed and the targeted
 * content-apply scripts (e.g. apply-about.ts). Keeping these in one module means
 * the seed and any single-page apply script author rich text identically — no
 * drift between "the full seed" and "update just this page".
 */
export const txt = (text: string, bold = false) => ({
  type: "text",
  text,
  format: bold ? 1 : 0,
  detail: 0,
  mode: "normal",
  style: "",
  version: 1,
});

export const para = (...children: unknown[]) => ({
  type: "paragraph",
  children,
  direction: "ltr",
  format: "",
  indent: 0,
  version: 1,
  textFormat: 0,
});

export const heading = (tag: "h2" | "h3", text: string) => ({
  type: "heading",
  tag,
  children: [txt(text)],
  direction: "ltr",
  format: "",
  indent: 0,
  version: 1,
});

export const doc = (...children: unknown[]) => ({
  root: { type: "root", children, direction: "ltr", format: "", indent: 0, version: 1 },
});

export const customLink = (label: string, url: string, extra: Record<string, unknown> = {}) => ({
  label,
  type: "custom" as const,
  url,
  ...extra,
});
