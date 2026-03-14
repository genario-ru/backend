import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";

import { PDFWriter } from "@/lib/documents/pdf-writer";
import { slugifyFileName } from "@/lib/documents/slugify-file-name";
import { type RenderedDocumentFile } from "@/lib/documents/types";

type IdeasListExportFormat = "pdf" | "docx";

export type IdeasListExportData = {
  id: string;
  name: string;
  description: string;
  targetAudience: string | null;
  profile: { name: string } | null;
  template: { name: string } | null;
  ideas: Array<{
    name: string;
    description: string;
    reason: string | null;
    saved: boolean;
    videoType: { name: string };
  }>;
  ideasListToTone: Array<{ tone: { name: string } }>;
  ideasListToVideoType: Array<{ videoType: { name: string } }>;
};

type RenderIdeasListExportParams = {
  format: IdeasListExportFormat;
  data: IdeasListExportData;
  savedOnly: boolean;
};

function getIdeasListTitle(data: IdeasListExportData) {
  return data.name?.trim() || "Список идей";
}

function getIdeasListFileName(
  data: IdeasListExportData,
  format: IdeasListExportFormat,
) {
  const baseName = slugifyFileName(getIdeasListTitle(data)) || "ideas-list";
  return `${baseName}.${format}`;
}

function getIdeasListMetaLines(data: IdeasListExportData, savedOnly: boolean) {
  return [
    `Описание: ${data.description || "Не указано"}`,
    `Целевая аудитория: ${data.targetAudience || "Не указана"}`,
    `Профиль: ${data.profile?.name || "Не указан"}`,
    `Шаблон: ${data.template?.name || "Не указан"}`,
    `Тоны: ${data.ideasListToTone.map(({ tone }) => tone.name).join(", ") || "Не указаны"}`,
    `Типы видео: ${data.ideasListToVideoType.map(({ videoType }) => videoType.name).join(", ") || "Не указаны"}`,
    `Экспорт только сохранённых: ${savedOnly ? "Да" : "Нет"}`,
    `Количество идей: ${data.ideas.length}`,
  ];
}

async function renderIdeasListPdf(
  data: IdeasListExportData,
  savedOnly: boolean,
) {
  const writer = await PDFWriter.create();

  writer.addTitle(getIdeasListTitle(data));

  for (const line of getIdeasListMetaLines(data, savedOnly)) {
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
  } satisfies RenderedDocumentFile;
}

async function renderIdeasListDocx(
  data: IdeasListExportData,
  savedOnly: boolean,
) {
  const children: Paragraph[] = [
    new Paragraph({
      text: getIdeasListTitle(data),
      heading: HeadingLevel.TITLE,
    }),
    ...getIdeasListMetaLines(data, savedOnly).map(
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
  } satisfies RenderedDocumentFile;
}

export async function renderIdeasListExport({
  format,
  data,
  savedOnly,
}: RenderIdeasListExportParams) {
  if (format === "pdf") {
    return renderIdeasListPdf(data, savedOnly);
  }

  return renderIdeasListDocx(data, savedOnly);
}
