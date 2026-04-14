import { Paragraph, TextRun } from "docx";
import slugify from "slugify";

import {
  createDocxDocument,
  labeledListItem,
  labeledParagraph,
} from "@/lib/docx";
import { PDFWriter } from "@/lib/pdf/classes/pdf-writer";
import { sanitizeText } from "@/shared/utils/regex/sanitize-text";

import type { ScenarioVersionExportData } from "./types";

type RenderScenarioVersionExportParams = {
  format: string;
  data: ScenarioVersionExportData;
};

export type RenderedDocumentFile = {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
};

type MetaItem = { label: string; value: string };

function formatTimeRange(startTime: number, endTime: number) {
  return `${startTime}-${endTime} сек`;
}

function getScenarioTitle(data: ScenarioVersionExportData) {
  return data.scenario.name?.trim() || "Сценарий";
}

function getScenarioFileName(data: ScenarioVersionExportData, format: string) {
  const scenarioSlug = slugify(getScenarioTitle(data)) || "scenario";
  return `${scenarioSlug}-version-${data.id.slice(0, 8)}.${format}`;
}

function getScenarioMetaItems(data: ScenarioVersionExportData): MetaItem[] {
  const items: MetaItem[] = [
    { label: "Количество глав", value: String(data.chapters.length) },
  ];

  if (data.scenario.description) {
    items.push({ label: "Описание", value: data.scenario.description });
  }

  if (data.scenario.targetAudience) {
    items.push({
      label: "Целевая аудитория",
      value: data.scenario.targetAudience,
    });
  }

  if (data.scenario.profile) {
    items.push({ label: "Профиль", value: data.scenario.profile.name });
  }

  if (data.scenario.platform) {
    items.push({ label: "Платформа", value: data.scenario.platform.name });
  }

  if (data.scenario.videoType) {
    items.push({ label: "Тип видео", value: data.scenario.videoType.name });
  }

  if (data.scenario.videoDuration) {
    items.push({
      label: "Длительность",
      value: data.scenario.videoDuration.name,
    });
  }

  if (data.scenario.tones && data.scenario.tones.length > 0) {
    items.push({
      label: "Тона",
      value: data.scenario.tones.map(({ name }) => name).join(", "),
    });
  }

  return items;
}

async function renderScenarioVersionPdf(
  data: ScenarioVersionExportData,
): Promise<RenderedDocumentFile> {
  const writer = await PDFWriter.create();

  writer.addTitle(getScenarioTitle(data));
  writer.addHeading("Основная информация");

  for (const { label, value } of getScenarioMetaItems(data)) {
    writer.addLabeledParagraph(label, value);
  }

  writer.addSpacer(20);
  writer.addHeading("Структура сценария");

  if (data.chapters.length === 0) {
    writer.addParagraph("В этой версии сценария пока нет глав.");
  }

  data.chapters.forEach((chapter, chapterIndex) => {
    writer.addSubheading(
      `${chapterIndex + 1}. ${chapter.name} (${formatTimeRange(chapter.startTime, chapter.endTime)})`,
    );
    writer.addLabeledParagraph(
      "Описание главы",
      chapter.description || "Не указано",
    );

    if (chapter.scenes.length === 0) {
      writer.addParagraph("Сцены пока не сгенерированы.");
      writer.addSpacer();
      return;
    }

    chapter.scenes.forEach((scene, sceneIndex) => {
      writer.addLabeledParagraph(
        `Сцена ${chapterIndex + 1}.${sceneIndex + 1}`,
        `${scene.name} (${formatTimeRange(scene.startTime, scene.endTime)})`,
      );

      if (scene.components.length === 0) {
        writer.addListItem("Компоненты отсутствуют.");
        return;
      }

      scene.components.forEach((component) => {
        writer.addLabeledListItem(
          component.type.name,
          component.content || "Не указано",
        );
      });
    });

    writer.addSpacer();
  });

  return {
    buffer: await writer.save(),
    fileName: getScenarioFileName(data, "pdf"),
    mimeType: "application/pdf",
  };
}

async function renderScenarioVersionDocx(
  data: ScenarioVersionExportData,
): Promise<RenderedDocumentFile> {
  const children: Paragraph[] = [
    new Paragraph({
      spacing: { before: 0, after: 240 },
      children: [
        new TextRun({
          text: sanitizeText(getScenarioTitle(data)),
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
    ...getScenarioMetaItems(data).map(({ label, value }) =>
      labeledParagraph(label, value),
    ),
    new Paragraph({
      spacing: { before: 240, after: 120 },
      children: [
        new TextRun({
          text: "Структура сценария",
          font: "Arial",
          bold: true,
          size: 36,
        }),
      ],
    }),
  ];

  if (data.chapters.length === 0) {
    children.push(
      new Paragraph({
        spacing: { before: 0, after: 60 },
        children: [
          new TextRun({
            text: "В этой версии сценария пока нет глав.",
            font: "Arial",
            size: 22,
          }),
        ],
      }),
    );
  }

  data.chapters.forEach((chapter, chapterIndex) => {
    children.push(
      new Paragraph({
        spacing: { before: 200, after: 80 },
        children: [
          new TextRun({
            text: sanitizeText(
              `${chapterIndex + 1}. ${chapter.name} (${formatTimeRange(chapter.startTime, chapter.endTime)})`,
            ),
            font: "Arial",
            bold: true,
            size: 28,
          }),
        ],
      }),
      labeledParagraph("Описание главы", chapter.description || "Не указано"),
    );

    if (chapter.scenes.length === 0) {
      children.push(
        new Paragraph({
          spacing: { before: 0, after: 60 },
          children: [
            new TextRun({
              text: "Сцены пока не сгенерированы.",
              font: "Arial",
              size: 22,
            }),
          ],
        }),
      );
      return;
    }

    chapter.scenes.forEach((scene, sceneIndex) => {
      children.push(
        new Paragraph({
          spacing: { before: 160, after: 60 },
          children: [
            new TextRun({
              text: `Сцена ${chapterIndex + 1}.${sceneIndex + 1}: `,
              font: "Arial",
              bold: true,
              size: 24,
            }),
            new TextRun({
              text: sanitizeText(
                `${scene.name} (${formatTimeRange(scene.startTime, scene.endTime)})`,
              ),
              font: "Arial",
              size: 24,
            }),
          ],
        }),
      );

      if (scene.components.length === 0) {
        children.push(
          new Paragraph({
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({
                text: "- Компоненты отсутствуют.",
                font: "Arial",
                size: 22,
              }),
            ],
          }),
        );
        return;
      }

      scene.components.forEach((component) => {
        children.push(
          labeledListItem(
            component.type.name,
            component.content || "Не указано",
          ),
        );
      });
    });
  });

  return {
    buffer: await createDocxDocument(children),
    fileName: getScenarioFileName(data, "docx"),
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
}

export async function renderScenarioVersionExport({
  format,
  data,
}: RenderScenarioVersionExportParams) {
  if (format === "pdf") {
    return renderScenarioVersionPdf(data);
  }

  return renderScenarioVersionDocx(data);
}
