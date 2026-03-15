import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";

import { PDFWriter } from "@/lib/documents/pdf-writer";
import { slugifyFileName } from "@/lib/documents/slugify-file-name";
import { type RenderedDocumentFile } from "@/lib/documents/types";

import type { IdeasListExportData } from "./types";

type RenderIdeasListExportParams = {
  format: string;
  data: IdeasListExportData;
};

function getIdeasListTitle(data: IdeasListExportData) {
  return data.name?.trim() || "Список идей";
}

function getIdeasListFileName(data: IdeasListExportData, format: string) {
  const baseName = slugifyFileName(getIdeasListTitle(data)) || "ideas-list";

  return `${baseName}.${format}`;
}

function getIdeasListMetaLines(data: IdeasListExportData) {
  const metaLines = [`Количество идей: ${data.ideas.length}`];

  if (data.description) {
    metaLines.push(`Описание: ${data.description}`);
  }

  if (data.targetAudience) {
    metaLines.push(`Целевая аудитория: ${data.targetAudience}`);
  }

  if (data.profile) {
    metaLines.push(`Профиль: ${data.profile.name}`);
  }

  if (data.template) {
    metaLines.push(`Шаблон: ${data.template.name}`);
  }

  if (data.tones.length > 0) {
    metaLines.push(`Тоны: ${data.tones.map(({ name }) => name).join(", ")}`);
  }

  if (data.videoTypes.length > 0) {
    metaLines.push(
      `Типы видео: ${data.videoTypes.map(({ name }) => name).join(", ")}`,
    );
  }

  return metaLines;
}

async function renderIdeasListPdf(
  data: IdeasListExportData,
): Promise<RenderedDocumentFile> {
  const writer = await PDFWriter.create();

  writer.addTitle(getIdeasListTitle(data));

  for (const line of getIdeasListMetaLines(data)) {
    writer.addParagraph(line);
  }

  writer.addHeading("Идеи");

  if (data.ideas.length === 0) {
    writer.addParagraph("По выбранным параметрам идеи отсутствуют.");
  }

  data.ideas.forEach((ideaItem, index) => {
    writer.addSubheading(`${index + 1}. ${ideaItem.name || "Без названия"}`);
    writer.addParagraph(`Тип видео: ${ideaItem.videoType.name}`);
    writer.addParagraph(`Описание: ${ideaItem.description || "Не указано"}`);
    writer.addParagraph(
      `Почему это сработает: ${ideaItem.reason || "Не указано"}`,
    );
    writer.addParagraph(`Сохранена: ${ideaItem.saved ? "Да" : "Нет"}`);
    writer.addSpacer();
  });

  return {
    buffer: await writer.save(),
    fileName: getIdeasListFileName(data, "pdf"),
    mimeType: "application/pdf",
  };
}

async function renderIdeasListDocx(
  data: IdeasListExportData,
): Promise<RenderedDocumentFile> {
  const children: Paragraph[] = [
    new Paragraph({
      text: getIdeasListTitle(data),
      heading: HeadingLevel.TITLE,
    }),
    ...getIdeasListMetaLines(data).map(
      (line) =>
        new Paragraph({
          text: line,
        }),
    ),
    new Paragraph({
      text: "Идеи",
      heading: HeadingLevel.HEADING_1,
    }),
  ];

  if (data.ideas.length === 0) {
    children.push(
      new Paragraph({
        text: "По выбранным параметрам идеи отсутствуют.",
      }),
    );
  }

  data.ideas.forEach((ideaItem, index) => {
    children.push(
      new Paragraph({
        text: `${index + 1}. ${ideaItem.name || "Без названия"}`,
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        children: [new TextRun(`Тип видео: ${ideaItem.videoType.name}`)],
      }),
      new Paragraph({
        children: [
          new TextRun(`Описание: ${ideaItem.description || "Не указано"}`),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun(
            `Почему это сработает: ${ideaItem.reason || "Не указано"}`,
          ),
        ],
      }),
      new Paragraph({
        children: [new TextRun(`Сохранена: ${ideaItem.saved ? "Да" : "Нет"}`)],
      }),
    );
  });

  const document = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  return {
    buffer: await Packer.toBuffer(document),
    fileName: getIdeasListFileName(data, "docx"),
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
}

export async function renderIdeasListExport({
  format,
  data,
}: RenderIdeasListExportParams) {
  if (format === "pdf") {
    return renderIdeasListPdf(data);
  }

  return renderIdeasListDocx(data);
}
