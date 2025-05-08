// eslint.config.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import prettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...tseslint.configs.recommended[1].rules,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  prettier,
];
