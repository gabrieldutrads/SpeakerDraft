import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@speaker-draft/core": path.resolve(__dirname, "../../packages/core/src"),
      "@speaker-draft/data": path.resolve(__dirname, "../../packages/data/src"),
      "@speaker-draft/design-tokens": path.resolve(__dirname, "../../packages/design-tokens/src"),
      "@speaker-draft/i18n": path.resolve(__dirname, "../../packages/i18n/src"),
      "@speaker-draft/db-types": path.resolve(__dirname, "../../packages/db-types/src"),
    },
  },
});