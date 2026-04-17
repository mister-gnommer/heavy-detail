import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/lib/analytics.ts", "src/lib/utils.ts", "src/components/**/*.tsx"],
      exclude: ["src/lib/db.ts", "src/lib/weightApi.ts", "src/lib/queryKeys.ts", "src/main.tsx"],
      thresholds: { lines: 80, functions: 80 },
    },
  },
});
