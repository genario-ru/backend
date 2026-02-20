type GenerateScenarioScenePreviewPromptProps = {
  scenarioName: string | null;
  scenarioDescription: string | null;
  scenarioTargetAudience: string | null;
  chapterName: string | null;
  chapterDescription: string | null;
  sceneName: string | null;
  sceneDescription: string | null;
  sceneStartTime: number;
  sceneEndTime: number;
};

export function generateScenarioScenePreviewPrompt({
  scenarioName,
  scenarioDescription,
  scenarioTargetAudience,
  chapterName,
  chapterDescription,
  sceneName,
  sceneDescription,
  sceneStartTime,
  sceneEndTime,
}: GenerateScenarioScenePreviewPromptProps): string {
  return `Cinematic preview image for video scene: "${sceneName}". ${sceneDescription}. Part of "${scenarioName}" - ${scenarioDescription}. Chapter: "${chapterName}" - ${chapterDescription}. Professional thumbnail quality, no text, single focal point, mood matching the scene. Target audience: ${scenarioTargetAudience}. Start time: ${sceneStartTime}s, end time: ${sceneEndTime}s.`;
}
