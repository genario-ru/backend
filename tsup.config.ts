import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/entrypoints/server.ts", "src/entrypoints/workers.ts"], // Your entryfiles here
  format: ["esm"], // Output format
  clean: true, // Clean the output directory before building
  minify: true, // Minify the output
  sourcemap: false, // Generate sourcemaps
  outDir: "dist", // Output directory
});
