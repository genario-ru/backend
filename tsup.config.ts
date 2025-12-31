import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"], // Your entry file
  format: ["esm"], // Output ESM (modern Node.js default; use 'cjs' if needed for older setups)
  clean: true, // Clean dist folder before build
  minify: true, // Minify for production
  sourcemap: false, // Disable sourcemaps for smaller builds (enable if debugging needed)
  outDir: "dist", // Output directory
});
