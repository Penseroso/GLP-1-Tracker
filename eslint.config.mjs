import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: [".next/**", ".npm-cache/**", "node_modules/**"],
  },
  {
    // Read-model boundary: only lib/clinical-evidence/** may import the raw
    // clinical data layer. Everything else must go through the selectors, so the
    // UI never touches the raw clinical arrays/indexes directly.
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/lib/clinical-evidence/data",
                "**/clinical-evidence/data",
              ],
              message:
                "Read clinical evidence through @/lib/clinical-evidence/selectors, not the raw data layer.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["lib/clinical-evidence/**"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
];

export default eslintConfig;
