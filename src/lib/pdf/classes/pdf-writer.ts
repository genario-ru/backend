import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, type PDFFont, type PDFPage, rgb } from "pdf-lib";

import { sanitizeText } from "@/shared/utils/regex/sanitize-text";

import { loadPdfFonts } from "../utils/load-pdf-fonts";

type Script = "latin" | "cyrillic";

type TextRun = {
  text: string;
  script: Script;
};

type FontSet = {
  latin: PDFFont;
  cyrillic: PDFFont;
};

const CYRILLIC_CHARACTER_PATTERN = /\p{Script=Cyrillic}/u;
const NEUTRAL_CHARACTER_PATTERN = /[\s.,!?;:()[\]{}\-"'`/\\|+*=<>@#$%^&_~]/u;

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const HORIZONTAL_MARGIN = 48;
const TOP_MARGIN = 56;
const BOTTOM_MARGIN = 56;
const MAX_LINE_WIDTH = PAGE_WIDTH - HORIZONTAL_MARGIN * 2;

function hasCyrillicCharacter(value: string) {
  return CYRILLIC_CHARACTER_PATTERN.test(value);
}

function isNeutralCharacter(value: string) {
  return NEUTRAL_CHARACTER_PATTERN.test(value);
}

function resolveScript(character: string): Script {
  if (isNeutralCharacter(character)) {
    return "latin";
  }

  return hasCyrillicCharacter(character) ? "cyrillic" : "latin";
}

function pushTextRun(runs: TextRun[], text: string, script: Script) {
  if (!text) {
    return;
  }

  runs.push({
    text,
    script,
  });
}

function splitTextRuns(value: string): TextRun[] {
  const runs: TextRun[] = [];
  let currentScript: Script = "latin";
  let currentText = "";

  for (const character of value) {
    const nextScript = resolveScript(character);

    if (currentText && nextScript !== currentScript) {
      pushTextRun(runs, currentText, currentScript);
      currentText = character;
      currentScript = nextScript;
      continue;
    }

    currentText += character;
    currentScript = nextScript;
  }

  pushTextRun(runs, currentText, currentScript);

  return runs;
}

function getFontForScript(fonts: FontSet, script: Script) {
  return script === "cyrillic" ? fonts.cyrillic : fonts.latin;
}

function measureTextWidth(text: string, size: number, fonts: FontSet) {
  return splitTextRuns(text).reduce((totalWidth, run) => {
    const font = getFontForScript(fonts, run.script);
    return totalWidth + font.widthOfTextAtSize(run.text, size);
  }, 0);
}

function breakLongToken(token: string, size: number, fonts: FontSet) {
  const chunks: string[] = [];
  let currentChunk = "";

  for (const character of token) {
    const nextChunk = `${currentChunk}${character}`;

    if (
      currentChunk &&
      measureTextWidth(nextChunk, size, fonts) > MAX_LINE_WIDTH
    ) {
      chunks.push(currentChunk);
      currentChunk = character;
      continue;
    }

    currentChunk = nextChunk;
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

function splitBrokenTokenIntoLines(
  token: string,
  size: number,
  fonts: FontSet,
) {
  const brokenTokenParts = breakLongToken(token, size, fonts);

  return {
    completedLines: brokenTokenParts.slice(0, -1),
    remainder: brokenTokenParts.at(-1) ?? "",
  };
}

function wrapText(text: string, size: number, fonts: FontSet) {
  const wrappedLines: string[] = [];

  for (const paragraph of text.split("\n")) {
    const tokens = paragraph.match(/\S+\s*/g) ?? [""];
    let currentLine = "";

    for (const token of tokens) {
      const nextLine = `${currentLine}${token}`;

      if (
        currentLine &&
        measureTextWidth(nextLine, size, fonts) > MAX_LINE_WIDTH
      ) {
        wrappedLines.push(currentLine.trimEnd());
        currentLine = token.trimStart();

        if (
          currentLine &&
          measureTextWidth(currentLine, size, fonts) > MAX_LINE_WIDTH
        ) {
          const { completedLines, remainder } = splitBrokenTokenIntoLines(
            currentLine,
            size,
            fonts,
          );
          wrappedLines.push(...completedLines);
          currentLine = remainder;
        }

        continue;
      }

      if (
        !currentLine &&
        measureTextWidth(token, size, fonts) > MAX_LINE_WIDTH
      ) {
        // Если одно слово длиннее строки, режем его на безопасные части,
        // иначе pdf-lib не сможет корректно перенести текст сам.
        const { completedLines, remainder } = splitBrokenTokenIntoLines(
          token.trim(),
          size,
          fonts,
        );
        wrappedLines.push(...completedLines);
        currentLine = remainder;
        continue;
      }

      currentLine = nextLine;
    }

    wrappedLines.push(currentLine.trimEnd());
  }

  return wrappedLines;
}

// Wraps text like wrapText, but the first line has less available width due to
// an inline prefix (e.g. a bold label) that occupies `offset` px before the text.
function wrapTextFirstLineOffset(
  text: string,
  size: number,
  fonts: FontSet,
  offset: number,
): string[] {
  const lines: string[] = [];
  let currentLine = "";
  let firstLineActive = true;

  for (const paragraph of text.split("\n")) {
    const tokens = paragraph.match(/\S+\s*/g) ?? [""];

    for (const token of tokens) {
      const maxWidth = firstLineActive
        ? MAX_LINE_WIDTH - offset
        : MAX_LINE_WIDTH;
      const nextLine = `${currentLine}${token}`;

      if (currentLine && measureTextWidth(nextLine, size, fonts) > maxWidth) {
        lines.push(currentLine.trimEnd());
        currentLine = token.trimStart();
        firstLineActive = false;
        continue;
      }

      currentLine = nextLine;
    }

    lines.push(currentLine.trimEnd());
    currentLine = "";
    firstLineActive = false;
  }

  return lines;
}

export class PDFWriter {
  private readonly fonts: FontSet;
  private readonly boldFonts: FontSet;
  private readonly pdfDocument: PDFDocument;
  private page: PDFPage;
  private currentY = PAGE_HEIGHT - TOP_MARGIN;

  private constructor(
    pdfDocument: PDFDocument,
    fonts: FontSet,
    boldFonts: FontSet,
  ) {
    this.pdfDocument = pdfDocument;
    this.fonts = fonts;
    this.boldFonts = boldFonts;
    this.page = pdfDocument.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  }

  static async create() {
    const pdfDocument = await PDFDocument.create();
    pdfDocument.registerFontkit(fontkit);

    const { latin, cyrillic, latinBold, cyrillicBold } = await loadPdfFonts();
    const [latinFont, cyrillicFont, latinBoldFont, cyrillicBoldFont] =
      await Promise.all([
        pdfDocument.embedFont(latin),
        pdfDocument.embedFont(cyrillic),
        pdfDocument.embedFont(latinBold),
        pdfDocument.embedFont(cyrillicBold),
      ]);

    return new PDFWriter(
      pdfDocument,
      { latin: latinFont, cyrillic: cyrillicFont },
      { latin: latinBoldFont, cyrillic: cyrillicBoldFont },
    );
  }

  addTitle(text: string) {
    this.addTextBlock(sanitizeText(text), 18, 16, this.boldFonts);
  }

  addHeading(text: string) {
    this.addTextBlock(sanitizeText(text), 16, 10, this.boldFonts);
  }

  addSubheading(text: string) {
    this.addTextBlock(sanitizeText(text), 13, 8, this.boldFonts);
  }

  addParagraph(text: string) {
    this.addTextBlock(sanitizeText(text), 11, 8);
  }

  addListItem(text: string) {
    this.addTextBlock(`- ${sanitizeText(text)}`, 11, 6);
  }

  // Renders "Label: value" with the label portion in bold.
  addLabeledParagraph(label: string, value: string) {
    const labelText = `${sanitizeText(label)}: `;
    const valueText = sanitizeText(value);
    const size = 11;
    const gapAfter = 8;
    const lineHeight = size * 1.35;

    const labelWidth = measureTextWidth(labelText, size, this.boldFonts);
    const valueLines = wrapTextFirstLineOffset(
      valueText,
      size,
      this.fonts,
      labelWidth,
    );
    const lines = valueLines.length > 0 ? valueLines : [""];

    this.ensureSpace(lines.length * lineHeight + gapAfter);

    this.drawLineAt(labelText, size, this.boldFonts, HORIZONTAL_MARGIN);
    if (lines[0]) {
      this.drawLineAt(
        lines[0],
        size,
        this.fonts,
        HORIZONTAL_MARGIN + labelWidth,
      );
    }
    this.currentY -= lineHeight;

    for (let i = 1; i < lines.length; i++) {
      this.drawLineAt(lines[i], size, this.fonts, HORIZONTAL_MARGIN);
      this.currentY -= lineHeight;
    }

    this.currentY -= gapAfter;
  }

  // Renders "- Label: value" with the label portion in bold and "- " in regular.
  addLabeledListItem(label: string, value: string) {
    const prefixText = "- ";
    const labelText = `${sanitizeText(label)}: `;
    const valueText = sanitizeText(value);
    const size = 11;
    const gapAfter = 6;
    const lineHeight = size * 1.35;

    const prefixWidth = measureTextWidth(prefixText, size, this.fonts);
    const labelWidth = measureTextWidth(labelText, size, this.boldFonts);
    const totalOffset = prefixWidth + labelWidth;

    const valueLines = wrapTextFirstLineOffset(
      valueText,
      size,
      this.fonts,
      totalOffset,
    );
    const lines = valueLines.length > 0 ? valueLines : [""];

    this.ensureSpace(lines.length * lineHeight + gapAfter);

    this.drawLineAt(prefixText, size, this.fonts, HORIZONTAL_MARGIN);
    this.drawLineAt(
      labelText,
      size,
      this.boldFonts,
      HORIZONTAL_MARGIN + prefixWidth,
    );
    if (lines[0]) {
      this.drawLineAt(
        lines[0],
        size,
        this.fonts,
        HORIZONTAL_MARGIN + totalOffset,
      );
    }
    this.currentY -= lineHeight;

    for (let i = 1; i < lines.length; i++) {
      this.drawLineAt(lines[i], size, this.fonts, HORIZONTAL_MARGIN);
      this.currentY -= lineHeight;
    }

    this.currentY -= gapAfter;
  }

  addSpacer(height = 6) {
    this.ensureSpace(height);
    this.currentY -= height;
  }

  async save() {
    const bytes = await this.pdfDocument.save();
    return Buffer.from(bytes);
  }

  private addTextBlock(
    text: string,
    size: number,
    gapAfter: number,
    fonts: FontSet = this.fonts,
  ) {
    const lines = wrapText(text, size, fonts);
    const lineHeight = size * 1.35;

    this.ensureSpace(lines.length * lineHeight + gapAfter);

    for (const line of lines) {
      this.drawLine(line, size, fonts);
      this.currentY -= lineHeight;
    }

    this.currentY -= gapAfter;
  }

  private drawLineAt(
    text: string,
    size: number,
    fonts: FontSet,
    startX: number,
  ) {
    let currentX = startX;

    for (const run of splitTextRuns(text)) {
      const font = getFontForScript(fonts, run.script);
      this.page.drawText(run.text, {
        x: currentX,
        y: this.currentY,
        size,
        font,
        color: rgb(0.08, 0.08, 0.08),
      });
      currentX += font.widthOfTextAtSize(run.text, size);
    }
  }

  private drawLine(text: string, size: number, fonts: FontSet = this.fonts) {
    this.drawLineAt(text, size, fonts, HORIZONTAL_MARGIN);
  }

  private ensureSpace(requiredHeight: number) {
    if (this.currentY - requiredHeight >= BOTTOM_MARGIN) {
      return;
    }

    this.page = this.pdfDocument.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.currentY = PAGE_HEIGHT - TOP_MARGIN;
  }
}
