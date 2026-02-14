type GenerateScenarioScenesPromptProps = {
  context: {
    scenarioName?: string | null;
    scenarioDescription?: string | null;
    scenarioTargetAudience?: string | null;
    chapterName: string;
    chapterDescription?: string | null;
    chapterStartTime: number;
    chapterEndTime: number;
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

    # Rules:
    - First scene must start at ${chapterStartTime}, last scene must end at ${chapterEndTime};
    - Each scene must have a unique angle;
    - Start/end time must be integers in seconds within chapter range;
    - Scenes must be in chronological order and not overlap.
  `;
}
