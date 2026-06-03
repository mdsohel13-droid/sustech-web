# Self-hosted fonts

Brand type is **self-hosted** (no Google/system fonts — see CLAUDE.md §11 and DESIGN-SYSTEM.md §2).
Download the `.woff2` files from Fontshare and drop them here, then wire `app/fonts.ts`
(`next/font/local`) and apply the CSS variables on `<html>` in `app/layout.tsx`:

- `CabinetGrotesk-Variable.woff2` → `--font-cabinet` (display / headlines)
- `Switzer-Variable.woff2` → `--font-switzer` (body / UI)
- `JetBrainsMono-Variable.woff2` → `--font-jetbrains` (mono / specs)

Until the files are present, `styles/globals.css` falls back to the generic `sans-serif`
family. Font wiring is intentionally deferred to the page-building phase so the scaffold
`next build` does not fail on missing font assets.
