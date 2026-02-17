type GenerateScenarioScenesPromptProps = {
  context: {
    scenarioName?: string | null;
    scenarioDescription?: string | null;
    scenarioTargetAudience?: string | null;
    chapterName: string;
    chapterDescription?: string | null;
    chapterStartTime: number;
    chapterEndTime: number;
    scenarioChaptersTimeline?: {
      id: string;
      name: string;
      description?: string | null;
      startTime: number;
      endTime: number;
    }[];
    alreadyGeneratedScenesByChapter?: {
      chapterId: string;
      chapterName: string;
      scenes: {
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
    scenarioChaptersTimeline,
    alreadyGeneratedScenesByChapter,
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
    - Scenario chapters timeline: ${JSON.stringify(scenarioChaptersTimeline ?? [])};
    - Already generated scenes for other chapters: ${JSON.stringify(alreadyGeneratedScenesByChapter ?? [])};

    # Rules:
    - First scene must start at ${chapterStartTime}, last scene must end at ${chapterEndTime};
    - Each scene must have a unique angle;
    - Start/end time must be integers in seconds within chapter range;
    - Scenes must be in chronological order and not overlap;
    - Keep narrative continuity with full scenario timeline and avoid repeating the same scene intent that already exists in other chapters.
  `;
}
