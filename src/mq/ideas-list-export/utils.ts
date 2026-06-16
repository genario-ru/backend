import { Paragraph, TextRun } from "docx";
import slugify from "slugify";

import { createDocxDocument, labeledParagraph } from "@/lib/docx";
import { PDFWriter } from "@/lib/pdf/classes/pdf-writer";
import { sanitizeText } from "@/shared/utils/regex/sanitize-text";

import type { IdeasListExportData } from "./types";

type RenderIdeasListExportParams = {
  format: string;
  data: IdeasListExportData;
};

export type RenderedDocumentFile = {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
};

type MetaItem = { label: string; value: string };

const SCORE_MAX = 5;

function getIdeasListTitle(data: IdeasListExportData) {
  return data.name?.trim() || "Список идей";
}

function getIdeasListFileName(data: IdeasListExportData, format: string) {
  const baseName = slugify(getIdeasListTitle(data)) || "ideas-list";

  return `${baseName}.${format}`;
}

function getIdeasListMetaItems(data: IdeasListExportData): MetaItem[] {
  const items: MetaItem[] = [
    { label: "Количество идей", value: String(data.ideas.length) },
  ];

  if (data.prompt) {
    items.push({ label: "Промпт", value: data.prompt });
  }

  if (data.description) {
    items.push({ label: "Описание", value: data.description });
  }

  if (data.targetAudience) {
    items.push({ label: "Целевая аудитория", value: data.targetAudience });
  }

  if (data.profile) {
    items.push({ label: "Профиль", value: data.profile.name });
  }

  if (data.template) {
    items.push({ label: "Шаблон", value: data.template.name });
  }

  if (data.tones.length > 0) {
    items.push({
      label: "Тона",
      value: data.tones.map(({ name }) => name).join(", "),
    });
  }

  if (data.videoTypes.length > 0) {
    items.push({
      label: "Типы видео",
      value: data.videoTypes.map(({ name }) => name).join(", "),
    });
  }

  return items;
}

async function renderIdeasListPdf(
  data: IdeasListExportData,
): Promise<RenderedDocumentFile> {
  const writer = await PDFWriter.create();

  writer.addTitle(getIdeasListTitle(data));
  writer.addHeading("Основная информация");

  for (const { label, value } of getIdeasListMetaItems(data)) {
    writer.addLabeledParagraph(label, value);
  }

  writer.addSpacer(20);
  writer.addHeading("Идеи");

  if (data.ideas.length === 0) {
    writer.addParagraph("По выбранным параметрам идеи отсутствуют.");
  }

  data.ideas.forEach((ideaItem, index) => {
    writer.addSubheading(`${index + 1}. ${ideaItem.name || "Без названия"}`);
    writer.addLabeledParagraph("Тип видео", ideaItem.videoType.name);
    writer.addLabeledParagraph(
      "Потенциал",
      `${ideaItem.potential} / ${SCORE_MAX}`,
    );
    writer.addLabeledParagraph(
      "Сложность",
      `${ideaItem.complexity} / ${SCORE_MAX}`,
    );
    writer.addLabeledParagraph("Хук", ideaItem.hook || "Не указано");
    writer.addLabeledParagraph(
      "Описание",
      ideaItem.description || "Не указано",
    );
    writer.addLabeledParagraph(
      "Почему это сработает",
      ideaItem.reason || "Не указано",
    );
    writer.addLabeledParagraph("Сохранена", ideaItem.saved ? "Да" : "Нет");
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
      spacing: { before: 0, after: 240 },
      children: [
        new TextRun({
          text: sanitizeText(getIdeasListTitle(data)),
          font: "Arial",
          bold: true,
          size: 40,
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 0, after: 120 },
      children: [
        new TextRun({
          text: "Основная информация",
          font: "Arial",
          bold: true,
          size: 36,
        }),
      ],
    }),
    ...getIdeasListMetaItems(data).map(({ label, value }) =>
      labeledParagraph(label, value),
    ),
    new Paragraph({
      spacing: { before: 240, after: 120 },
      children: [
        new TextRun({
          text: "Идеи",
          font: "Arial",
          bold: true,
          size: 36,
        }),
      ],
    }),
  ];

  if (data.ideas.length === 0) {
    children.push(
      new Paragraph({
        spacing: { before: 0, after: 60 },
        children: [
          new TextRun({
            text: "По выбранным параметрам идеи отсутствуют.",
            font: "Arial",
            size: 22,
          }),
        ],
      }),
    );
  }

  data.ideas.forEach((ideaItem, index) => {
    children.push(
      new Paragraph({
        spacing: { before: 200, after: 80 },
        children: [
          new TextRun({
            text: sanitizeText(
              `${index + 1}. ${ideaItem.name || "Без названия"}`,
            ),
            font: "Arial",
            bold: true,
            size: 28,
          }),
        ],
      }),
      labeledParagraph("Тип видео", ideaItem.videoType.name),
      labeledParagraph("Потенциал", `${ideaItem.potential} / ${SCORE_MAX}`),
      labeledParagraph("Сложность", `${ideaItem.complexity} / ${SCORE_MAX}`),
      labeledParagraph("Хук", ideaItem.hook || "Не указано"),
      labeledParagraph("Описание", ideaItem.description || "Не указано"),
      labeledParagraph("Почему это сработает", ideaItem.reason || "Не указано"),
    );
  });

  return {
    buffer: await createDocxDocument(children),
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
