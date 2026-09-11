import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Allow explicit any in specific fintech utility contexts
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow empty interfaces for extension patterns
      "@typescript-eslint/no-empty-object-type": "warn",
      // Unused vars — error except for prefixed _vars
      "@typescript-eslint/no-unused-vars": ["error", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
    },
    ignores: [".next/**", "node_modules/**", "dist/**"],
  }
);
