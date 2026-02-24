import {
  buildContextLines,
  formatPreviousItems,
} from "@/prompts/utils/build-context-lines";

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
    description?: string | null;
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
      let badge: string;

      if (ct.optional) {
        badge = "[optional]";
      } else {
        badge = "[required]";
      }

      let desc: string;

      if (ct.description) {
        desc = `: ${ct.description}`;
      } else {
        desc = "";
      }

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
  let preview: string;

  if (c.content && c.content.length > 100) {
    preview = c.content.slice(0, 100) + "…";
  } else {
    preview = c.content ?? "(empty)";
  }

  return `[${c.name}]: ${preview}`;
}

type PreviousScene = NonNullable<PreviousChapter["scenes"]>[number];

function formatScene(s: PreviousScene): string {
  if (!s) return "";

  let comps: string;

  if (s.components && s.components.length > 0) {
    comps = s.components.map(formatComponentPreview).join("\n");
  } else {
    comps = "(no components)";
  }

  return `- "${s.name}" (${s.startTime}s–${s.endTime}s)\n${comps}`;
}

function formatChapter(ch: PreviousChapter, index: number): string {
  let scenes: string;

  if (ch.scenes && ch.scenes.length > 0) {
    scenes = ch.scenes.map(formatScene).join("\n");
  } else {
    scenes = "(no scenes yet)";
  }

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

  return `
    Break chapter "${chapterName}" into ${sceneCount} scenes that fill ${chapterStartTime}s – ${chapterEndTime}s. For each scene, also generate its components (voice-over, visuals, etc.) in one pass.

    ## Part 1 — Scenes

    Each scene: name, description, startTime, endTime.
    - Scenes must be contiguous (scene N endTime = scene N+1 startTime).
    - First scene starts at ${chapterStartTime}, last ends at ${chapterEndTime}.
    - Maintain narrative continuity with previous chapters.

    ## Part 2 — Components (per scene)

    For each scene, generate components from the types below. Use the type's name exactly (e.g. "Голосовое сопровождение").
    - **Timing**: spoken/on-screen text must fit the scene duration. ${buildWordBudgetHint(5)} for 5s, ${buildWordBudgetHint(15)} for 15s, ${buildWordBudgetHint(30)} for 30s.
    - **Continuity**: first scene in chapter — open with a hook. Later scenes — continue from the previous scene's last thought, no re-greeting.
    - **Required components**: include all. Optional: only when they enrich the scene.
    - Omit a component if you cannot produce meaningful content.

    ## Component types
    ${buildComponentTypesBlock(availableSceneComponentTypes)}

    ## Output structure
    For each scene: { name, description, startTime, endTime, components: [{ name, content, typeId }] }
    - name: use component type name exactly.
    - content: natural speech within word budget; Markdown for utility components.
    - typeId: exact id from the list above.

    ## Context
    ${contextLines}

    ## Previous chapters (scenes + components for continuity)
    ${formatPreviousChapters(previousGeneratedChapters)}

    ## Example

    Chapter "Проблема: три причины" (7s–28s), 3 scenes:

    Scene 1: name "Иллюзия прогресса", description "Автор в кадре о первых двух неделях...", startTime 7, endTime 15
    components: [
      { name: "Цель и задачи сцены", content: "Создать момент узнавания...", typeId: "..." },
      { name: "Голосовое сопровождение", content: "Первые две недели — кайф. Мышцы болят, весы падают. Только этот минус два — не жир. Это вода.", typeId: "..." },
      { name: "Визуальное сопровождение", content: "Крупный план автора, затем врезка весов.", typeId: "..." }
    ]

    Scene 2: name "Момент X: весы останавливаются", startTime 15, endTime 21
    components: [ ... ]

    Scene 3: name "Психология отказа", startTime 21, endTime 28
    components: [ ... ]
  `.trim();
}
