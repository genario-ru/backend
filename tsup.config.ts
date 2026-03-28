import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/entrypoints/server.ts", "src/entrypoints/workers.ts"],
  format: ["esm"],
  clean: true,
  minify: true,
  sourcemap: false,
  outDir: "dist",
  loader: { ".md": "text" },
});
