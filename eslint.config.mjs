import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// eslint-config-next's core-web-vitals bundles eslint-plugin-jsx-a11y (recommended)
// and eslint-plugin-react-hooks, so we extend that base rather than re-registering
// those plugins (re-registering a plugin in flat config throws "Cannot redefine plugin").
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "react-hooks/exhaustive-deps": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
    "coverage/**",
    // Plain CJS utility scripts (screenshots, one-off helpers) — not part of the app bundle
    "scripts/**",
  ]),
]);

export default eslintConfig;
