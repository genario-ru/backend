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

type PreviousScene = {
  id: string;
  name: string;
  description?: string | null;
  startTime: number;
  endTime: number;
  components?: {
    id: string;
    name: string;
    typeId: string;
    content?: string | null;
  }[];
};

type GenerateScenarioSceneComponentsPromptProps = {
  context: {
    scenarioName: string;
    scenarioDescription: string;
    scenarioTargetAudience: string;
    chapterName: string;
    chapterDescription: string;
    chapterStartTime: number;
    chapterEndTime: number;
    sceneName: string;
    sceneDescription: string;
    sceneStartTime: number;
    sceneEndTime: number;
    availableSceneComponentTypes: ComponentType[];
    previousGeneratedScenes?: PreviousScene[];
  };
};

function buildComponentTypesBlock(types: ComponentType[]): string {
  return types
    .map((ct) => {
      const badge = ct.optional ? "[optional]" : "[required]";
      const desc = ct.description ? `: ${ct.description}` : "";
      return `- "${ct.name}" (id: ${ct.id}) ${badge}${desc}`;
    })
    .join("\n");
}

function buildPreviousScenesBlock(scenes?: PreviousScene[]): string {
  return formatPreviousItems(scenes, (scene, i) => {
    const components =
      scene.components && scene.components.length > 0
        ? scene.components
          .map((c) => {
            const preview =
              c.content && c.content.length > 150
                ? c.content.slice(0, 150) + "…"
                : (c.content ?? "(empty)");
            return `    [${c.name}]: ${preview}`;
          })
          .join("\n")
        : "    (no components)";
    return `${i + 1}. "${scene.name}" (${scene.startTime}s–${scene.endTime}s)\n${components}`;
  });
}

function buildContinuityRule(isFirstScene: boolean): string {
  if (isFirstScene) {
    return "This is the first scene — open with a hook or a question that grabs attention immediately. A greeting is acceptable only if it's natural for the format.";
  }
  return "Continue from where the previous scene left off. The first sentence must bridge naturally from the previous scene's last thought — never re-greet the viewer or repeat the opening.";
}

export function generateScenarioSceneComponentsPrompt({
  context,
}: GenerateScenarioSceneComponentsPromptProps) {
  const {
    scenarioName,
    scenarioDescription,
    scenarioTargetAudience,
    chapterName,
    chapterDescription,
    chapterStartTime,
    chapterEndTime,
    sceneName,
    sceneDescription,
    sceneStartTime,
    sceneEndTime,
    availableSceneComponentTypes,
    previousGeneratedScenes,
  } = context;

  const sceneDuration = sceneEndTime - sceneStartTime;
  const isFirstScene =
    !previousGeneratedScenes || previousGeneratedScenes.length === 0;

  const contextLines = buildContextLines([
    ["Scenario", `${scenarioName} — ${scenarioDescription}`],
    ["Target audience", scenarioTargetAudience],
    [
      "Chapter",
      `${chapterName} (${chapterStartTime}s–${chapterEndTime}s) — ${chapterDescription}`,
    ],
    [
      "Current scene",
      `${sceneName} (${sceneStartTime}s–${sceneEndTime}s, ${sceneDuration}s) — ${sceneDescription}`,
    ],
  ]);

  return `
    Generate components for scene "${sceneName}" (${sceneStartTime}s–${sceneEndTime}s).

    ## Task
    Write production-ready content for each component of this scene. The content goes directly into the video production pipeline — no rewriting, no placeholders. This scene is part of a continuous video; the viewer must not feel a hard cut or a topic restart.

    ## Rules for spoken and on-screen text (voice-over, narration, host speech, subtitles)

    1. ${buildContinuityRule(isFirstScene)}
    2. Write in natural, flowing prose — 2–4 short paragraphs separated by blank lines. Each paragraph is 1–3 sentences readable aloud without editing.
    3. Vary openings, sentence length, and rhythm. Mix short punchy statements with longer explanatory ones.
    4. Every paragraph must advance the narrative — new information, a new angle, or a concrete example. No restating what was already said unless adding a contrast or consequence.
    5. Use specific, vivid language for the target audience. Replace filler phrases like "в этом видео мы поговорим о..." with direct, engaging speech.

    ## Component types
    ${buildComponentTypesBlock(availableSceneComponentTypes)}

    ## Field requirements

    name:
    - Provided name of the scene component type.
    - Good: "Голос за кадром: иллюзия прогресса"
    - Bad: "Компонент 1" / "Голос"

    typeId:
    - Use the exact "id" from the component types list above.
    - Include all required components. Include optional ones only when they meaningfully enrich the scene.

    content:
    - Spoken/on-screen text: flowing prose per the rules above.
    - Utility components (goals, production notes, checklists): structured Markdown is fine.
    - Omit the component entirely if you cannot produce meaningful content for it.

    ## Context
    ${contextLines}

    ## Previous scenes (maintain flow — read content to avoid repetition)
    ${buildPreviousScenesBlock(previousGeneratedScenes)}

    ## Example

    Scenario: "Почему 90% людей бросают спортзал" | Scene: "Иллюзия прогресса в первые две недели" (7s–15s, first scene in chapter "Проблема")

    Voice-over component example:
    - name: "Голос за кадром: иллюзия прогресса"
    - content:
      "Первые две недели в зале — это кайф. Мышцы болят, значит, что-то происходит. Весы показали минус два — значит, всё идёт по плану.

      Но вот в чём штука. Этот минус два — не жир. Это вода. И когда тело адаптируется к нагрузке, прогресс внешне замирает. А человек думает, что сломался он."

    Scenario: "Почему 90% людей бросают спортзал" | Scene: "Психология отказа — почему мозг говорит «стоп»" (21s–28s, continues from previous scenes)

    Voice-over component example:
    - name: "Голос за кадром: механизм отказа"
    - content:
      "Это не вопрос силы воли. Мозг буквально получает сигнал: стресс есть, а вознаграждения нет. И он делает единственное разумное, с его точки зрения, решение — останавливает тебя.

      Именно поэтому в спорте выигрывают не те, кто сильнее мотивирован. А те, кто убрал момент принятия решения из уравнения."
  `.trim();
}
