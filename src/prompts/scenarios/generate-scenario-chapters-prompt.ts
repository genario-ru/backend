import { buildContextLines } from "@/lib/ai/utils/build-context-lines";

type GenerateScenarioChaptersPromptProps = {
  context: {
    scenarioName?: string | null;
    scenarioDescription?: string | null;
    scenarioTargetAudience?: string | null;
    scenarioTemplateName?: string | null;
    scenarioTemplateDescription?: string | null;
    scenarioProfileName?: string | null;
    scenarioProfileDescription?: string | null;
    scenarioPlatformName?: string | null;
    scenarioVideoTypeName?: string | null;
    scenarioVideoDurationName?: string | null;
    scenarioMinimumDurationSeconds?: number | null;
    scenarioMaximumDurationSeconds?: number | null;
    scenarioTones?: string[];
  };
};

function estimateChapterCount(
  durationSeconds: number,
  isOpenEnded: boolean,
): string {
  if (isOpenEnded) return "8–10";
  if (durationSeconds <= 30) return "2–3";
  if (durationSeconds <= 60) return "3–4";
  if (durationSeconds <= 120) return "3–5";
  if (durationSeconds <= 300) return "4–6";
  if (durationSeconds <= 600) return "5–8";
  if (durationSeconds <= 1800) return "6–10";
  return "8–10";
}

function buildTimelineInstruction(
  isOpenEnded: boolean,
  chapterCount: string,
  maxDuration: number,
  minDuration: number,
): string {
  if (isOpenEnded) {
    return `Divide the video scenario into ${chapterCount} chapters starting from 0 seconds. The video has no fixed end time — choose a total duration that fits the content naturally (at least ${minDuration}s).`;
  }
  return `Divide the video scenario into ${chapterCount} chapters covering exactly 0 to ${maxDuration} seconds.`;
}

function buildEndTimeRule(
  isOpenEnded: boolean,
  maxDuration: number,
  minDuration: number,
): string {
  if (isOpenEnded) {
    return `First chapter starts at 0. Last chapter ends at the total duration you choose (at least ${minDuration}s).`;
  }
  return `First chapter starts at 0. Last chapter ends at exactly ${maxDuration}.`;
}

export function generateScenarioChaptersPrompt({
  context,
}: GenerateScenarioChaptersPromptProps) {
  const {
    scenarioName,
    scenarioDescription,
    scenarioTargetAudience,
    scenarioTemplateName,
    scenarioTemplateDescription,
    scenarioProfileName,
    scenarioProfileDescription,
    scenarioPlatformName,
    scenarioVideoTypeName,
    scenarioVideoDurationName,
    scenarioMinimumDurationSeconds,
    scenarioMaximumDurationSeconds,
    scenarioTones,
  } = context;

  const minDuration = scenarioMinimumDurationSeconds ?? 0;
  const isOpenEnded = scenarioMaximumDurationSeconds == null;
  const maxDuration = scenarioMaximumDurationSeconds ?? minDuration;
  const chapterCount = estimateChapterCount(maxDuration, isOpenEnded);

  const contextLines = buildContextLines([
    ["Scenario name", scenarioName],
    ["Scenario description", scenarioDescription],
    ["Target audience", scenarioTargetAudience],
    ["Template name", scenarioTemplateName],
    ["Template description", scenarioTemplateDescription],
    ["Profile name", scenarioProfileName],
    ["Profile description", scenarioProfileDescription],
    ["Platform", scenarioPlatformName],
    ["Video type", scenarioVideoTypeName],
    ["Video duration", scenarioVideoDurationName],
    ["Tones", scenarioTones?.join(", ")],
  ]);

  return `
    ${buildTimelineInstruction(isOpenEnded, chapterCount, maxDuration, minDuration)}

    ## Task
    Structure the video as a series of narrative chapters. Each chapter is one self-contained story beat — hook, problem setup, insight, resolution, call-to-action, etc. Together they must create a smooth arc that keeps the viewer engaged from start to finish.

    ## Field requirements

    name (max 100 characters):
    - A concise label for what this chapter accomplishes in the story.
    - Good: "Крючок: вопрос, который останавливает скролл"
    - Good: "Проблема: почему стандартные диеты не работают"
    - Bad: "Глава 1" / "Введение" / "Основная часть"

    description (100–400 characters):
    - 2–3 sentences: key message, visual approach, and emotional beat.
    - Write as a creative brief for a video editor — not a table of contents.

    startTime / endTime (integers, seconds):
    - ${buildEndTimeRule(isOpenEnded, maxDuration, minDuration)}
    - Chapters must be contiguous — chapter N's endTime equals chapter N+1's startTime.
    - Distribute time proportionally: hook and closing are typically shorter than the core content sections.

    ## Context
    ${contextLines}

    ## Example

    Scenario: "Почему 90% людей бросают спортзал" — мотивационное видео для аудитории 20–35 лет, 60 секунд

    Chapter 1:
    - name: "Крючок: вопрос, который останавливает скролл"
    - description: "Автор с места в карьер задаёт провокационный вопрос в камеру. Крупный план, контрастный фон, никаких вступлений. Цель — остановить скролл и создать ощущение, что это видео именно про тебя."
    - startTime: 0
    - endTime: 7

    Chapter 2:
    - name: "Проблема: три причины, которые никто не называет"
    - description: "Быстрый разбор скрытых причин провала — не лень, а психология первых недель. Динамичный монтаж с текстовыми вставками. Зритель узнаёт себя и хочет услышать решение."
    - startTime: 7
    - endTime: 28

    Chapter 3:
    - name: "Решение: одна привычка вместо трёх часов в зале"
    - description: "Автор раскрывает неочевидный принцип, который меняет отношение к тренировкам. Темп замедляется, акцент на конкретике. Смена локации визуально сигнализирует переход к сути."
    - startTime: 28
    - endTime: 50

    Chapter 4:
    - name: "Финал: что делать прямо сейчас"
    - description: "Короткое резюме и конкретный следующий шаг для зрителя. Энергичная интонация, текстовый оверлей с CTA. Конец без затухания — резкий и запоминающийся."
    - startTime: 50
    - endTime: 60
  `.trim();
}
