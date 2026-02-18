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
    scenarioChaptersTimeline?: {
      id: string;
      name: string;
      startTime: number;
      endTime: number;
    }[];
    chapterScenesTimeline?: {
      id: string;
      name: string;
      description?: string | null;
      startTime: number;
      endTime: number;
    }[];
    scenePositionInChapter?: {
      index: number;
      total: number;
    };
    alreadyGeneratedComponentsFromPreviousScenes?: {
      sceneId: string;
      sceneName: string;
      components: {
        name: string;
        typeId: string;
        content?: string | null;
      }[];
    }[];
    availableSceneComponentTypes: {
      id: string;
      name: string;
      description: string | null;
      optional: boolean;
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
    scenarioChaptersTimeline,
    chapterScenesTimeline,
    scenePositionInChapter,
    alreadyGeneratedComponentsFromPreviousScenes,
    availableSceneComponentTypes,
  } = context;

  return `
    # Instructions:
    - Generate components for the scene based on provided context and data.

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
    - Scenario chapters timeline: ${JSON.stringify(scenarioChaptersTimeline ?? [])};
    - Chapter scenes timeline: ${JSON.stringify(chapterScenesTimeline ?? [])};
    - Current scene position in chapter: ${JSON.stringify(scenePositionInChapter ?? null)};
    - Already generated components from previous scenes: ${JSON.stringify(alreadyGeneratedComponentsFromPreviousScenes ?? [])};
    - Available scene component types: ${JSON.stringify(availableSceneComponentTypes)};

    # Rules:
    - Each component must have a unique name;
    - Only return components that are available in the available scene component types list;
    - If scene component is optional, it can be omitted;
    - Component "content" must be useful Markdown text (paragraphs, bullet lists, emphasis where helpful), not plain one-line text.
  `;
}
