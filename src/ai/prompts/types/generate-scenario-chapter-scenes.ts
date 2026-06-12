import type { SceneComponentType } from "@/ai/prompts/types/generate-scenario-scenes";

export type ChapterToGenerate = {
  index: number;
  name: string;
  description?: string | null;
  startTime: number;
  endTime: number;
};

export type GenerateScenarioChapterScenesPromptContext = {
  scenarioName?: string | null;
  scenarioDescription?: string | null;
  scenarioTargetAudience?: string | null;
  chapters: ChapterToGenerate[];
  availableSceneComponentTypes: SceneComponentType[];
};

export type GenerateScenarioChapterScenesPromptProps = {
  context: GenerateScenarioChapterScenesPromptContext;
};
