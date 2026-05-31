import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@/auth": fileURLToPath(new URL("./auth.ts", import.meta.url)),
      "@/env": fileURLToPath(new URL("./env.ts", import.meta.url)),
    },
  },
  test: {
    dir: "./tests",
    environment: "node",
    restoreMocks: true,
  },
});
