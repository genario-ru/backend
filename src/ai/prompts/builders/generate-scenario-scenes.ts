import template from "@/ai/prompts/templates/generate-scenario-scenes.md";
import type {
  GenerateScenarioScenesPromptProps,
  PreviousChapter,
  PreviousScene,
  PreviousSceneComponent,
  SceneComponentType,
} from "@/ai/prompts/types/generate-scenario-scenes";
import {
  buildContextLines,
  formatPreviousItems,
} from "@/ai/utils/build-context-lines";
import { interpolate } from "@/ai/utils/interpolate-template";

const WORDS_PER_SECOND = 2.2;

export function generateScenarioScenesPrompt({
  context,
}: GenerateScenarioScenesPromptProps) {
  const {
    scenarioName,
    scenarioDescription,
    scenarioTargetAudience,
    chapterName,
    chapterDescription,
    chapterStartTime,
    chapterEndTime,
    availableSceneComponentTypes,
    previousGeneratedChapters,
  } = context;

  const chapterDuration = chapterEndTime - chapterStartTime;
  const sceneCount = estimateSceneCount(chapterDuration);

  const contextLines = buildContextLines([
    ["Scenario name", scenarioName],
    ["Scenario description", scenarioDescription],
    ["Target audience", scenarioTargetAudience],
    ["Chapter name", chapterName],
    ["Chapter description", chapterDescription],
    [
      "Chapter time range",
      `${chapterStartTime}s – ${chapterEndTime}s (${chapterDuration}s total)`,
    ],
  ]);

  return interpolate(template, {
    CHAPTER_NAME: chapterName,
    SCENE_COUNT: sceneCount,
    TIME_RANGE: `${chapterStartTime}s – ${chapterEndTime}s`,
    CHAPTER_START: String(chapterStartTime),
    CHAPTER_END: String(chapterEndTime),
    WORD_BUDGET_HINTS: `${buildWordBudgetHint(5)} for 5s, ${buildWordBudgetHint(15)} for 15s, ${buildWordBudgetHint(30)} for 30s.`,
    COMPONENT_TYPES: buildComponentTypesBlock(availableSceneComponentTypes),
    CONTEXT: contextLines,
    PREVIOUS_CHAPTERS: formatPreviousChapters(previousGeneratedChapters),
  });
}

function estimateSceneCount(chapterDurationSeconds: number): string {
  if (chapterDurationSeconds <= 8) return "2–3";
  if (chapterDurationSeconds <= 15) return "3";
  if (chapterDurationSeconds <= 30) return "3–4";
  if (chapterDurationSeconds <= 60) return "4–5";
  if (chapterDurationSeconds <= 120) return "4–6";
  if (chapterDurationSeconds <= 300) return "5–7";
  return "6–9";
}

function buildComponentTypesBlock(types: SceneComponentType[]): string {
  return types
    .map((ct) => {
      const badge = ct.optional ? "[optional]" : "[required]";
      const desc = ct.description ? `: ${ct.description}` : "";

      return `- "${ct.name}" (id: ${ct.id}) ${badge}${desc}`;
    })
    .join("\n");
}

function buildWordBudgetHint(durationSeconds: number): string {
  const maxWords = Math.round(durationSeconds * WORDS_PER_SECOND);
  const base = `~${maxWords} words max — `;

  switch (true) {
    case durationSeconds <= 3:
      return base + "one short phrase";
    case durationSeconds <= 7:
      return base + "1–2 short sentences";
    case durationSeconds <= 15:
      return base + "2–4 short sentences";
    case durationSeconds <= 30:
      return base + "1–2 compact paragraphs";
    default:
      return base + "2–4 paragraphs";
  }
}

function formatComponentPreview(c: PreviousSceneComponent): string {
  const preview =
    c.content && c.content.length > 200
      ? c.content.slice(0, 200) + "…"
      : (c.content ?? "(empty)");

  return `[${c.name}]: ${preview}`;
}

function formatScene(scene: PreviousScene): string {
  if (!scene) return "";

  const comps =
    scene.components && scene.components.length > 0
      ? scene.components.map(formatComponentPreview).join("\n")
      : "(no components)";

  return `- "${scene.name}" (${scene.startTime}s–${scene.endTime}s)\n${comps}`;
}

function formatChapter(chapter: PreviousChapter, index: number): string {
  const scenes =
    chapter.scenes && chapter.scenes.length > 0
      ? chapter.scenes.map(formatScene).join("\n")
      : "(no scenes yet)";

  return `${index + 1}. "${chapter.name}" (${chapter.startTime}s–${chapter.endTime}s)\n${scenes}`;
}

function formatPreviousChapters(chapters?: PreviousChapter[]): string {
  return formatPreviousItems(chapters, formatChapter);
}
