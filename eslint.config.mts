import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  {
    ignores: ["generated/**", "node_modules/**", "dist/**"],
  },
  {
    files: ["**/*.ts"],

    languageOptions: {
      parser: tsparser,
      sourceType: "module",
    },

    plugins: {
      "@typescript-eslint": tseslint,
    },

    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      semi: ["error", "always"],
      quotes: ["error", "double"],
    },
  },
];
