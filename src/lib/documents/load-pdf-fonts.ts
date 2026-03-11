import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const rootDirectory = path.resolve(currentDirectory, "../../../");

// Шрифты читаются из локального `node_modules`, чтобы PDF-генерация
// не зависела от сети и всегда использовала один и тот же набор glyph'ов.
const latinFontPath = path.join(
  rootDirectory,
  "node_modules",
  "@fontsource",
  "noto-sans",
  "files",
  "noto-sans-latin-ext-400-normal.woff",
);

const cyrillicFontPath = path.join(
  rootDirectory,
  "node_modules",
  "@fontsource",
  "noto-sans",
  "files",
  "noto-sans-cyrillic-ext-400-normal.woff",
);

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
