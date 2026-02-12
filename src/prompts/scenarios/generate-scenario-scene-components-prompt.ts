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
  } = context;

  return `
    Generate components for the scene.

    Context:
    Scenario name: "${scenarioName}";
    Scenario description: "${scenarioDescription}";
    Target audience: "${scenarioTargetAudience}";

    Chapter:
    Name: "${chapterName}";
    Description: "${chapterDescription}";
    Start time: ${chapterStartTime};
    End time: ${chapterEndTime};

    Scene:
    Name: "${sceneName}";
    Description: "${sceneDescription}";
    Start time: ${sceneStartTime};
    End time: ${sceneEndTime};

    Instructions:
    - Do NOT return explanations or comments.
    - Do NOT wrap the response in markdown.
    - Each component must have a unique name.
    - Components must be in chronological order and not overlap.
    - Only return components that are available in the availableSceneComponentTypes array.
    - If component is optional, it can be omitted.
    - Return valid JSON only.
  `;
}
