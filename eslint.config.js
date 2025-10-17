// @ts-check

import { FlatCompat } from "@eslint/eslintrc";
import { globalIgnores } from "eslint/config";
import pluginSecurity from "eslint-plugin-security";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import { dirname } from "path";
import { configs as tseslintConfigs } from "typescript-eslint";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// TODO: Отрефакторить, чтобы использовался 'defineConfig' из 'eslint/config'
// Плюс возможно убрать что-то лишнее
const eslintConfig = [
  globalIgnores(["dist"]),
  ...compat.extends("plugin:import/recommended", "plugin:prettier/recommended"),
  pluginSecurity.configs.recommended,
  ...tseslintConfigs.recommended,
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "quote-props": [2, "consistent"],
      "simple-import-sort/exports": 2,
      "simple-import-sort/imports": 2,
      "import/no-unresolved": 0,
      "import/named": 0,
      "security/detect-object-injection": 0,
      "@typescript-eslint/no-explicit-any": 0,
      "@typescript-eslint/ban-ts-comment": 0,
      "@typescript-eslint/no-unused-vars": [
        1,
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
];

export default eslintConfig;
