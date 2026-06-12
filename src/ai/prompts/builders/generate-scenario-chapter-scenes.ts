import template from "@/ai/prompts/templates/generate-scenario-chapter-scenes.md";
import type {
  ChapterToGenerate,
  GenerateScenarioChapterScenesPromptProps,
} from "@/ai/prompts/types/generate-scenario-chapter-scenes";
import type { SceneComponentType } from "@/ai/prompts/types/generate-scenario-scenes";
import { buildContextLines } from "@/ai/utils/build-context-lines";
import { interpolate } from "@/ai/utils/interpolate-template";

const WORDS_PER_SECOND = 2.2;

export function generateScenarioChapterScenesPrompt({
  context,
}: GenerateScenarioChapterScenesPromptProps) {
  const {
    scenarioName,
    scenarioDescription,
    scenarioTargetAudience,
    chapters,
    availableSceneComponentTypes,
  } = context;

  const contextLines = buildContextLines([
    ["Scenario name", scenarioName],
    ["Scenario description", scenarioDescription],
    ["Target audience", scenarioTargetAudience],
    ["Chapter count", String(chapters.length)],
  ]);

  return interpolate(template, {
    CHAPTER_COUNT: String(chapters.length),
    CHAPTER_INDEXES: chapters.map((chapter) => chapter.index).join(", "),
    WORD_BUDGET_HINTS: `${buildWordBudgetHint(5)} for 5s, ${buildWordBudgetHint(15)} for 15s, ${buildWordBudgetHint(30)} for 30s.`,
    COMPONENT_TYPES: buildComponentTypesBlock(availableSceneComponentTypes),
    CONTEXT: contextLines,
    CHAPTERS: buildChaptersBlock(chapters),
  });
}

function buildChaptersBlock(chapters: ChapterToGenerate[]): string {
  return chapters
    .map((chapter) => {
      const duration = chapter.endTime - chapter.startTime;
      const sceneCount = estimateSceneCount(duration);
      const description = chapter.description ? `\n${chapter.description}` : "";

      return `${chapter.index}. "${chapter.name}" (${chapter.startTime}s–${chapter.endTime}s, ${duration}s total) — recommended scene count: ${sceneCount}${description}`;
    })
    .join("\n\n");
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

      return `- name: "${ct.name}" ${badge}${desc}\n  typeId: "${ct.id}"`;
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
