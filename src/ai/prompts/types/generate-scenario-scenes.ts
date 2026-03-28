export type SceneComponentType = {
  id: string;
  name: string;
  description: string | null;
  optional: boolean;
};

export type PreviousSceneComponent = {
  name: string;
  content?: string | null;
};

export type PreviousScene = {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  components?: PreviousSceneComponent[];
};

export type PreviousChapter = {
  id: string;
  name: string;
  description?: string | null;
  startTime: number;
  endTime: number;
  scenes?: PreviousScene[];
};

export type GenerateScenarioScenesPromptContext = {
  scenarioName?: string | null;
  scenarioDescription?: string | null;
  scenarioTargetAudience?: string | null;
  chapterName: string;
  chapterDescription?: string | null;
  chapterStartTime: number;
  chapterEndTime: number;
  availableSceneComponentTypes: SceneComponentType[];
  previousGeneratedChapters?: PreviousChapter[];
};

export type GenerateScenarioScenesPromptProps = {
  context: GenerateScenarioScenesPromptContext;
};
