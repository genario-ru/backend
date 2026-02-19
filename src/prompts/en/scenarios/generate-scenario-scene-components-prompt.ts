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
    availableSceneComponentTypes: {
      id: string;
      name: string;
      description: string | null;
      optional: boolean;
    }[];
    previousGeneratedScenes?: {
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
    }[];
  };
};

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

  return `
    # Instructions:
    - Generate scene components based on provided context and data.
    - Treat this scene as part of one continuous video narrative. The viewer should not feel "hard cuts" between scenes.
    - For components that include spoken/on-screen text (voice-over, narration, subtitles, text read by host), output production-ready text that can be used as-is without rewriting.
    - Reuse context from previous scenes to keep continuity of topic, tone and rhythm, while still moving the story forward.

    # Context:
    - Scenario name: "${scenarioName}";
    - Scenario description: "${scenarioDescription}";
    - Scenario target audience: "${scenarioTargetAudience}";
    - Chapter name: "${chapterName}";
    - Chapter description: "${chapterDescription}";
    - Chapter start time: ${chapterStartTime};
    - Chapter end time: ${chapterEndTime};
    - Scene name: "${sceneName}";
    - Scene description: "${sceneDescription}";
    - Scene start time: ${sceneStartTime};
    - Scene end time: ${sceneEndTime}.

    # Data:
    - Previous generated scenes: ${JSON.stringify(previousGeneratedScenes ?? [])};
    - Available scene component types: ${JSON.stringify(availableSceneComponentTypes)};

    # Rules:
    - Each component must have a unique name;
    - Only return components that are available in the available scene component types list;
    - If scene component is optional, it can be omitted;
    - For text components that are spoken or shown to the viewer (voice-over / narration / subtitles), content must be natural flowing prose in 1-3 paragraphs, not checklists, not headings, not templates;
    - For those spoken/shown text components, NEVER restart the communication with greetings or repeated intro phrases ("hello", "welcome back", etc.) unless current scene is explicitly the first scene in chapter;
    - For those spoken/shown text components, first sentence should smoothly continue the previous thought if previous scene data exists;
    - Avoid repetitive sentence skeletons across neighboring scenes: vary openings, syntax, rhythm, and transition words;
    - Do not re-explain the same point from previous scenes unless adding a new angle, contrast, consequence, or example;
    - Keep wording concrete and vivid for the target audience; avoid bureaucratic or generic filler;
    - For non-spoken utility components (for example goals, checklists, production notes), Markdown structure can be used.
  `;
}
