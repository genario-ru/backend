import { Document, Packer, Paragraph, TextRun } from "docx";

import { sanitizeText } from "@/shared/utils/regex/sanitize-text";

export async function createDocxDocument(
  children: Paragraph[],
): Promise<Buffer> {
  const document = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  return Packer.toBuffer(document);
}

export function labeledParagraph(label: string, value: string): Paragraph {
  return new Paragraph({
    spacing: { before: 0, after: 60 },
    children: [
      new TextRun({
        text: `${sanitizeText(label)}: `,
        font: "Arial",
        bold: true,
        size: 22,
      }),
      new TextRun({
        text: sanitizeText(value),
        font: "Arial",
        size: 22,
      }),
    ],
  });
}

export function labeledListItem(label: string, value: string): Paragraph {
  return new Paragraph({
    spacing: { before: 0, after: 40 },
    children: [
      new TextRun({ text: "- ", font: "Arial", size: 22 }),
      new TextRun({
        text: `${sanitizeText(label)}: `,
        font: "Arial",
        bold: true,
        size: 22,
      }),
      new TextRun({
        text: sanitizeText(value),
        font: "Arial",
        size: 22,
      }),
    ],
  });
}
