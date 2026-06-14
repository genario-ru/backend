export type ScenePreviewComponent = {
  slug: string;
  name: string;
  content: string | null;
};

export type GenerateScenarioScenePreviewPromptProps = {
  scenarioName: string | null;
  scenarioDescription: string | null;
  scenarioTargetAudience: string | null;
  videoTypeSlug: string | null;
  toneNames: string[];
  chapterName: string | null;
  chapterDescription: string | null;
  sceneName: string | null;
  sceneComponents: ScenePreviewComponent[];
};
