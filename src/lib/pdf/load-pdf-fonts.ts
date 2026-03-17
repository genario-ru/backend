import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const latinFontPath =
  require.resolve("@fontsource/noto-sans/files/noto-sans-latin-400-normal.woff");

const cyrillicFontPath =
  require.resolve("@fontsource/noto-sans/files/noto-sans-cyrillic-400-normal.woff");

let fontBuffersPromise:
  | Promise<{
      latin: Uint8Array;
      cyrillic: Uint8Array;
    }>
  | undefined;

export function loadPdfFonts() {
  fontBuffersPromise ??= Promise.all([
    readFile(latinFontPath),
    readFile(cyrillicFontPath),
  ]).then(([latin, cyrillic]) => ({
    latin,
    cyrillic,
  }));

  return fontBuffersPromise;
}
