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
  } = context;

  return `
    Instructions:
    - Generate components for the scene based on provided context and data.

    Context:
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

    Data:
    - Available scene component types: ${JSON.stringify(availableSceneComponentTypes)};

    Rules:
    - Each component must have a unique name;
    - Only return components that are available in the available scene component types list;
    - If scene component is optional, it can be omitted.
  `;
}
