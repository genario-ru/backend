import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const latinFontPath =
  require.resolve("@fontsource/noto-sans/files/noto-sans-latin-400-normal.woff");

const cyrillicFontPath =
  require.resolve("@fontsource/noto-sans/files/noto-sans-cyrillic-400-normal.woff");

const latinBoldFontPath =
  require.resolve("@fontsource/noto-sans/files/noto-sans-latin-700-normal.woff");

const cyrillicBoldFontPath =
  require.resolve("@fontsource/noto-sans/files/noto-sans-cyrillic-700-normal.woff");

let fontBuffersPromise:
  | Promise<{
      latin: Uint8Array;
      cyrillic: Uint8Array;
      latinBold: Uint8Array;
      cyrillicBold: Uint8Array;
    }>
  | undefined;

export function loadPdfFonts() {
  fontBuffersPromise ??= Promise.all([
    readFile(latinFontPath),
    readFile(cyrillicFontPath),
    readFile(latinBoldFontPath),
    readFile(cyrillicBoldFontPath),
  ]).then(([latin, cyrillic, latinBold, cyrillicBold]) => ({
    latin,
    cyrillic,
    latinBold,
    cyrillicBold,
  }));

  return fontBuffersPromise;
}
