import {
  buildContextLines,
  formatPreviousItems,
} from "@/prompts/utils/build-context-lines";

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
  }[];
};

type GenerateScenarioScenesPromptProps = {
  context: {
    scenarioName?: string | null;
    scenarioDescription?: string | null;
    scenarioTargetAudience?: string | null;
    chapterName: string;
    chapterDescription?: string | null;
    chapterStartTime: number;
    chapterEndTime: number;
    previousGeneratedChapters?: PreviousChapter[];
  };
};

function estimateSceneCount(chapterDurationSeconds: number): string {
  if (chapterDurationSeconds <= 8) return "2";
  if (chapterDurationSeconds <= 15) return "2–3";
  if (chapterDurationSeconds <= 30) return "2–3";
  if (chapterDurationSeconds <= 60) return "3–4";
  if (chapterDurationSeconds <= 120) return "3–5";
  if (chapterDurationSeconds <= 300) return "4–6";
  return "5–8";
}

function formatPreviousChapters(chapters?: PreviousChapter[]): string {
  return formatPreviousItems(chapters, (ch, i) => {
    const scenes =
      ch.scenes && ch.scenes.length > 0
        ? ch.scenes
          .map((s) => `    - "${s.name}" (${s.startTime}s–${s.endTime}s)`)
          .join("\n")
        : "    (no scenes yet)";
    return `${i + 1}. "${ch.name}" (${ch.startTime}s–${ch.endTime}s): ${ch.description ?? "no description"}\n${scenes}`;
  });
}

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
    Break chapter "${chapterName}" into ${sceneCount} scenes that fill ${chapterStartTime}s – ${chapterEndTime}s without gaps or overlaps.

    ## Task
    Decompose this chapter into individual scenes. Each scene is one atomic unit — one camera setup, one visual beat, one idea. Together they must deliver the chapter's message with smooth transitions and a clear internal arc.

    Maintain narrative continuity: reference what happened in previous chapters, advance the story, and avoid repeating scene intent that already exists elsewhere in the scenario.

    ## Field requirements

    name (max 100 characters):
    - A specific label for what happens on screen.
    - Good: "Автор показывает статистику на экране телефона"
    - Good: "Резкая смена ракурса — живая реакция зрителей"
    - Bad: "Сцена 1" / "Продолжение" / "Основная часть"

    description (100–400 characters):
    - 2–3 sentences: what the viewer sees and hears, the emotional beat, and how this scene leads into the next.
    - Write as production notes for a director.

    startTime / endTime (integers, seconds):
    - First scene starts at ${chapterStartTime}. Last scene ends at ${chapterEndTime}.
    - Scenes must be contiguous — scene N's endTime equals scene N+1's startTime.
    - Distribute time by content weight — key moments get more time, transitions less.

    ## Context
    ${contextLines}

    ## Other chapters (for narrative continuity)
    ${formatPreviousChapters(previousGeneratedChapters)}

    ## Example

    Scenario: "Почему 90% людей бросают спортзал" | Chapter: "Проблема: три причины, которые никто не называет" (7s–28s)

    Scene 1:
    - name: "Иллюзия прогресса в первые две недели"
    - description: "Автор говорит в камеру о знакомом ощущении: первые тренировки — боль, усталость, но ощущение победы. Крупный план лица, живая интонация. Зритель кивает — это именно про него."
    - startTime: 7
    - endTime: 15

    Scene 2:
    - name: "Момент X: весы останавливаются"
    - description: "Смена ракурса — автор жестом показывает на условные весы. Резкий переход от подъёма к разочарованию. Текстовый оверлей с цифрой усиливает эффект."
    - startTime: 15
    - endTime: 21

    Scene 3:
    - name: "Психология отказа — почему мозг говорит «стоп»"
    - description: "Автор объясняет механизм: мозг воспринимает стресс без видимого прогресса как сигнал опасности. Спокойный, чуть замедленный темп. Зрителю становится понятно — это не слабость, это физиология."
    - startTime: 21
    - endTime: 28
  `.trim();
}
