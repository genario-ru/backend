import { Document, HeadingLevel, Packer, Paragraph } from "docx";

import { PDFWriter } from "@/lib/documents/pdf-writer";
import { slugifyFileName } from "@/lib/documents/slugify-file-name";
import { type RenderedDocumentFile } from "@/lib/documents/types";

type ScenarioVersionExportFormat = "pdf" | "docx";

export type ScenarioVersionExportData = {
  id: string;
  scenario: {
    name: string;
    description: string | null;
    targetAudience: string | null;
    profile: { name: string } | null;
    platform: { name: string } | null;
    videoType: { name: string } | null;
    videoDuration: { name: string } | null;
    scenarioToTone: Array<{ tone: { name: string } }>;
  };
  chapters: Array<{
    name: string;
    description: string | null;
    startTime: number;
    endTime: number;
    scenes: Array<{
      name: string;
      startTime: number;
      endTime: number;
      components: Array<{
        name: string;
        content: string | null;
        type: { name: string };
      }>;
    }>;
  }>;
};

type RenderScenarioVersionExportParams = {
  format: ScenarioVersionExportFormat;
  data: ScenarioVersionExportData;
};

function formatTimeRange(startTime: number, endTime: number) {
  return `${startTime}-${endTime} сек`;
}

function getScenarioTitle(data: ScenarioVersionExportData) {
  return data.scenario.name?.trim() || "Сценарий";
}

function getScenarioFileName(
  data: ScenarioVersionExportData,
  format: ScenarioVersionExportFormat,
) {
  const scenarioSlug = slugifyFileName(getScenarioTitle(data)) || "scenario";
  return `${scenarioSlug}-version-${data.id.slice(0, 8)}.${format}`;
}

function getScenarioMetaLines(data: ScenarioVersionExportData) {
  return [
    `Описание: ${data.scenario.description || "Не указано"}`,
    `Целевая аудитория: ${data.scenario.targetAudience || "Не указана"}`,
    `Профиль: ${data.scenario.profile?.name || "Не указан"}`,
    `Платформа: ${data.scenario.platform?.name || "Не указана"}`,
    `Тип видео: ${data.scenario.videoType?.name || "Не указан"}`,
    `Длительность: ${data.scenario.videoDuration?.name || "Не указана"}`,
    `Тоны: ${data.scenario.scenarioToTone.map(({ tone }) => tone.name).join(", ") || "Не указаны"}`,
    `Количество глав: ${data.chapters.length}`,
  ];
}

async function renderScenarioVersionPdf(data: ScenarioVersionExportData) {
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
  } satisfies RenderedDocumentFile;
}

async function renderScenarioVersionDocx(data: ScenarioVersionExportData) {
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
  } satisfies RenderedDocumentFile;
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
