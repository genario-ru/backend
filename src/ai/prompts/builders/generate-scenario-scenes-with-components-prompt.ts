import template from "@/ai/prompts/templates/generate-scenario-scenes.md";
import {
  buildContextLines,
  formatPreviousItems,
} from "@/ai/utils/build-context-lines";
import { interpolate } from "@/ai/utils/interpolate-template";

type ComponentType = {
  id: string;
  name: string;
  description: string | null;
  optional: boolean;
};

type PreviousChapter = {
  id: string;
  name: string;
  description?: string | null;
  startTime: number;
  endTime: number;
  scenes?: {
    id: string;
    name: string;
    startTime: number;
    endTime: number;
    components?: {
      name: string;
      content?: string | null;
    }[];
  }[];
};

type GenerateScenarioScenesWithComponentsPromptProps = {
  context: {
    scenarioName?: string | null;
    scenarioDescription?: string | null;
    scenarioTargetAudience?: string | null;
    chapterName: string;
    chapterDescription?: string | null;
    chapterStartTime: number;
    chapterEndTime: number;
    availableSceneComponentTypes: ComponentType[];
    previousGeneratedChapters?: PreviousChapter[];
  };
};

const WORDS_PER_SECOND = 2.2;

function estimateSceneCount(chapterDurationSeconds: number): string {
  if (chapterDurationSeconds <= 8) return "2";
  if (chapterDurationSeconds <= 15) return "2–3";
  if (chapterDurationSeconds <= 30) return "2–3";
  if (chapterDurationSeconds <= 60) return "3–4";
  if (chapterDurationSeconds <= 120) return "3–5";
  if (chapterDurationSeconds <= 300) return "4–6";
  return "5–8";
}

function buildComponentTypesBlock(types: ComponentType[]): string {
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

function formatComponentPreview(c: {
  name: string;
  content?: string | null;
}): string {
  const preview =
    c.content && c.content.length > 100
      ? c.content.slice(0, 100) + "…"
      : (c.content ?? "(empty)");
  return `[${c.name}]: ${preview}`;
}

type PreviousScene = NonNullable<PreviousChapter["scenes"]>[number];

function formatScene(s: PreviousScene): string {
  if (!s) return "";
  const comps =
    s.components && s.components.length > 0
      ? s.components.map(formatComponentPreview).join("\n")
      : "(no components)";
  return `- "${s.name}" (${s.startTime}s–${s.endTime}s)\n${comps}`;
}

function formatChapter(ch: PreviousChapter, index: number): string {
  const scenes =
    ch.scenes && ch.scenes.length > 0
      ? ch.scenes.map(formatScene).join("\n")
      : "(no scenes yet)";
  return `${index + 1}. "${ch.name}" (${ch.startTime}s–${ch.endTime}s)\n${scenes}`;
}

function formatPreviousChapters(chapters?: PreviousChapter[]): string {
  return formatPreviousItems(chapters, formatChapter);
}

export function generateScenarioScenesPrompt({
  context,
}: GenerateScenarioScenesWithComponentsPromptProps) {
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
