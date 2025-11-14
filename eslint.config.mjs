import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Project-specific ignores
    "public/**",
    "scripts/**",
    "config/**",
  ]),
  // Custom rules
  {
    rules: {
      // Prevent hardcoded Tailwind colors - enforce design tokens
      "no-restricted-syntax": [
        "warn",
        {
          selector:
            "Literal[value=/text-(blue|red|green|yellow|purple|pink|indigo|orange)-[0-9]/]",
          message:
            "Use design tokens instead of hardcoded colors (e.g., text-primary, text-success, text-error)",
        },
        {
          selector:
            "Literal[value=/bg-(blue|red|green|yellow|purple|pink|indigo|orange)-[0-9]/]",
          message:
            "Use design tokens instead of hardcoded colors (e.g., bg-primary-light, bg-success)",
        },
        {
          selector:
            "Literal[value=/border-(blue|red|green|yellow|purple|pink|indigo|orange)-[0-9]/]",
          message:
            "Use design tokens instead of hardcoded colors (e.g., border-primary, border-success-light)",
        },
      ],
    },
  },
]);

export default eslintConfig;
