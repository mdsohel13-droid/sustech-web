# SETUP.md — Repo Scaffold & Quality Gates

Bootstrap the project and wire the gates so "clean lints, zero errors" is enforced automatically. Use **pnpm**.

## 1. Bootstrap

```bash
pnpm create next-app@latest sustech-web \
  --typescript --tailwind --app --eslint --src-dir=false --import-alias "@/*"
cd sustech-web

# core deps
pnpm add motion clsx tailwind-merge lucide-react
pnpm add @radix-ui/react-slot class-variance-authority   # shadcn primitives base

# dev / quality
pnpm add -D prettier prettier-plugin-tailwindcss \
  eslint-plugin-jsx-a11y \
  vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom \
  @playwright/test \
  husky lint-staged \
  @lhci/cli
pnpm dlx playwright install --with-deps chromium
pnpm dlx husky init
```

## 2. `package.json` scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "lint": "eslint --max-warnings=0",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run && playwright test",
    "test:unit": "vitest run",
    "test:e2e": "playwright test",
    "lighthouse": "lhci autorun",
    "verify": "pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --max-warnings=0", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

`pnpm verify` is the single command that runs the entire gate. Claude Code runs it before declaring any task done.

> **Next.js 16 note:** `next lint` was removed in Next 16, so the `lint` script calls the ESLint CLI directly (`eslint --max-warnings=0`).
>
> **Local port note:** some Windows dev hosts reserve port `3000` (WinNAT excluded port range → `EACCES` on bind). On such a host, run the dev server on `4123` (`pnpm dev --port 4123`); the Playwright e2e server (`playwright.config.ts`) and Lighthouse (`lighthouserc.json`) are already pointed at `4123`. The `dev`/`start` scripts keep the conventional `3000` default so CI/Linux is unaffected.

## 3. `tsconfig.json` (strict)

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## 4. `eslint.config.mjs` (ESLint 9 flat, zero-warning, a11y)

```js
import next from "eslint-config-next";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  ...next,
  jsxA11y.flatConfigs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "react-hooks/exhaustive-deps": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }]
    }
  },
  { ignores: [".next/", "node_modules/", "playwright-report/", "coverage/"] }
];
```

## 5. `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

## 6. Husky pre-commit — `.husky/pre-commit`

```sh
pnpm lint-staged
pnpm typecheck
```

## 7. `next.config.ts` (security headers + images)

```ts
import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { formats: ["image/avif", "image/webp"] },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};
export default nextConfig;
```

> Add a Content-Security-Policy via middleware once the asset/domain list is known (chat widget, analytics).

## 8. GitHub Actions CI — `.github/workflows/ci.yml`

```yaml
name: CI
on:
  push: { branches: [main] }
  pull_request: {}
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm format:check
      - run: pnpm test:unit
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm test:e2e
      - run: pnpm build
```

Set branch protection on `main`: require the `verify` check to pass before merge.

## 9. `.env.example`

```
# Public site
SITE_URL=https://beta.sustechltd.com
SITE_INDEXABLE=false            # false on beta, true at production cutover

# CMS (Payload) — web tier holds only what it needs to READ published content
CMS_API_URL=
CMS_READ_TOKEN=

# Chat proxy (server-side only; never exposed to client)
ANTHROPIC_API_KEY=
CHAT_RATE_LIMIT=30

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# NOTE: no ERP credentials here. Ever. Hermes owns ERP access on the ops tier.
```

## 10. `vitest.config.ts`

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", globals: true, setupFiles: ["./tests/setup.ts"] },
});
```

## 11. `lighthouserc.json` (budgets)

```json
{
  "ci": {
    "collect": { "url": ["http://localhost:3000/"], "startServerCommand": "pnpm start" },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }]
      }
    }
  }
}
```

## 12. First commands after scaffolding

```bash
# drop in the config files above, add fonts to /public/fonts, then:
pnpm verify     # everything must be green before building features
git add -A && git commit -m "chore: scaffold + quality gates"
```

If `pnpm verify` is green on an empty scaffold, the gate is correctly wired and Phase 1 can begin.
