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
    Generate scenes for the chapter.

    Context:
    Scenario name: "${scenarioName}";
    Scenario description: "${scenarioDescription}";
    Target audience: "${scenarioTargetAudience}";

    Chapter:
    Name: "${chapterName}";
    Description: "${chapterDescription}";
    Start time: ${chapterStartTime};
    End time: ${chapterEndTime};

    Instructions:
    - Do NOT return explanations or comments.
    - Do NOT wrap the response in markdown.
    - Each scene must have a unique angle.
    - Start/end time must be integers in seconds within chapter range.
    - Scenes must be in chronological order and not overlap.
    - First scene must start at ${chapterStartTime}, last scene must end at ${chapterEndTime}.
    - Return valid JSON only with shape:
      {"scenes":[{"name": "...","description": "...","startTime": 0,"endTime": 10,"badges": null}]}
  `;
}
