type GenerateScenarioScenesPromptProps = {
  context: {
    scenarioName?: string | null;
    scenarioDescription?: string | null;
    scenarioTargetAudience?: string | null;
    chapterName: string;
    chapterDescription?: string | null;
    chapterStartTime: number;
    chapterEndTime: number;
    previousGeneratedChapters?: {
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
    }[];
  };
};

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

  return `
    # Instructions:
    - Generate scenario scenes for the chapter based on provided context and data.

    # Context:
    - Scenario name: "${scenarioName}";
    - Scenario description: "${scenarioDescription}";
    - Scenario target audience: "${scenarioTargetAudience}";
    - Chapter name: "${chapterName}";
    - Chapter description: "${chapterDescription}";
    - Chapter start time: ${chapterStartTime};
    - Chapter end time: ${chapterEndTime}.

    # Data:
    - Previous generated chapters: ${JSON.stringify(previousGeneratedChapters)};

    # Rules:
    - First scene must start at ${chapterStartTime}, last scene must end at ${chapterEndTime};
    - Each scene must have a unique angle;
    - Start/end time must be integers in seconds within chapter range;
    - Scenes must be in chronological order and not overlap;
    - Keep narrative continuity with full scenario timeline and avoid repeating the same scene intent that already exists in other chapters;
    - Use ONLY one language consistently inside the whole output: the same dominant language as the input context, without mixing languages inside scene names/descriptions.
  `;
}
