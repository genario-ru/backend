import { Document, HeadingLevel, Packer, Paragraph } from "docx";
import slugify from "slugify";

import { PDFWriter } from "@/lib/pdf/classes/pdf-writer";

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

function getScenarioMetaLines(data: ScenarioVersionExportData) {
  const metaLines = [`Количество глав: ${data.chapters.length}`];

  if (data.scenario.description) {
    metaLines.push(`Описание: ${data.scenario.description}`);
  }

  if (data.scenario.targetAudience) {
    metaLines.push(`Целевая аудитория: ${data.scenario.targetAudience}`);
  }

  if (data.scenario.profile) {
    metaLines.push(`Профиль: ${data.scenario.profile.name}`);
  }

  if (data.scenario.platform) {
    metaLines.push(`Платформа: ${data.scenario.platform.name}`);
  }

  if (data.scenario.videoType) {
    metaLines.push(`Тип видео: ${data.scenario.videoType.name}`);
  }

  if (data.scenario.videoDuration) {
    metaLines.push(`Длительность: ${data.scenario.videoDuration.name}`);
  }

  if (data.scenario.tones && data.scenario.tones.length > 0) {
    metaLines.push(
      `Тоны: ${data.scenario.tones.map(({ name }) => name).join(", ")}`,
    );
  }

  return metaLines;
}

async function renderScenarioVersionPdf(
  data: ScenarioVersionExportData,
): Promise<RenderedDocumentFile> {
  const writer = await PDFWriter.create();

  writer.addTitle(getScenarioTitle(data));

  for (const line of getScenarioMetaLines(data)) {
    writer.addParagraph(line);
  }

  writer.addHeading("Структура сценария");

  if (data.chapters.length === 0) {
    writer.addParagraph("В этой версии сценария пока нет глав.");
  }

  data.chapters.forEach((chapter, chapterIndex) => {
    writer.addSubheading(
      `${chapterIndex + 1}. ${chapter.name} (${formatTimeRange(chapter.startTime, chapter.endTime)})`,
    );
    writer.addParagraph(
      `Описание главы: ${chapter.description || "Не указано"}`,
    );

    if (chapter.scenes.length === 0) {
      writer.addParagraph("Сцены пока не сгенерированы.");
      writer.addSpacer();
      return;
    }

    chapter.scenes.forEach((scene, sceneIndex) => {
      writer.addParagraph(
        `Сцена ${chapterIndex + 1}.${sceneIndex + 1}: ${scene.name} (${formatTimeRange(scene.startTime, scene.endTime)})`,
      );

      if (scene.components.length === 0) {
        writer.addListItem("Компоненты отсутствуют.");
        return;
      }

      scene.components.forEach((component) => {
        writer.addListItem(
          `${component.type.name}: ${component.name}${component.content ? ` - ${component.content}` : ""}`,
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
      text: getScenarioTitle(data),
      heading: HeadingLevel.TITLE,
    }),
    ...getScenarioMetaLines(data).map(
      (line) =>
        new Paragraph({
          text: line,
        }),
    ),
    new Paragraph({
      text: "Структура сценария",
      heading: HeadingLevel.HEADING_1,
    }),
  ];

  if (data.chapters.length === 0) {
    children.push(
      new Paragraph({
        text: "В этой версии сценария пока нет глав.",
      }),
    );
  }

  data.chapters.forEach((chapter, chapterIndex) => {
    children.push(
      new Paragraph({
        text: `${chapterIndex + 1}. ${chapter.name} (${formatTimeRange(chapter.startTime, chapter.endTime)})`,
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: `Описание главы: ${chapter.description || "Не указано"}`,
      }),
    );

    if (chapter.scenes.length === 0) {
      children.push(
        new Paragraph({
          text: "Сцены пока не сгенерированы.",
        }),
      );
      return;
    }

    chapter.scenes.forEach((scene, sceneIndex) => {
      children.push(
        new Paragraph({
          text: `Сцена ${chapterIndex + 1}.${sceneIndex + 1}: ${scene.name} (${formatTimeRange(scene.startTime, scene.endTime)})`,
          heading: HeadingLevel.HEADING_3,
        }),
      );

      if (scene.components.length === 0) {
        children.push(
          new Paragraph({
            text: "- Компоненты отсутствуют.",
          }),
        );
        return;
      }

      scene.components.forEach((component) => {
        children.push(
          new Paragraph({
            text: `- ${component.type.name}: ${component.name}${component.content ? ` - ${component.content}` : ""}`,
          }),
        );
      });
    });
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
