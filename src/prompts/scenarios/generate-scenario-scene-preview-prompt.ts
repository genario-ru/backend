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

function buildSceneContext(
  props: GenerateScenarioScenePreviewPromptProps,
): string {
  const {
    scenarioName,
    scenarioDescription,
    scenarioTargetAudience,
    chapterName,
    chapterDescription,
    sceneName,
    sceneDescription,
    sceneStartTime,
    sceneEndTime,
  } = props;

  const parts: string[] = [];

  if (sceneName) parts.push(`Scene: "${sceneName}".`);
  if (sceneDescription) parts.push(sceneDescription);
  parts.push(`Timestamp: ${sceneStartTime}s–${sceneEndTime}s.`);
  if (chapterName) parts.push(`Chapter: "${chapterName}".`);
  if (chapterDescription) parts.push(chapterDescription);
  if (scenarioName) {
    let videoPart = `Video: "${scenarioName}"`;
    if (scenarioDescription) {
      videoPart += ` — ${scenarioDescription}`;
    }
    parts.push(`${videoPart}.`);
  }
  if (scenarioTargetAudience)
    parts.push(`Target audience: ${scenarioTargetAudience}.`);

  return parts.join(" ");
}

export function generateScenarioScenePreviewPrompt(
  props: GenerateScenarioScenePreviewPromptProps,
): string {
  return `
    Create a cinematic preview image for this video scene.

    ${buildSceneContext(props)}

    Style:
    - Single clear focal point that captures the scene's emotional core.
    - Mood, lighting, and color palette matching the scene's tone.
    - Photorealistic or high-quality illustration style.
    - Composition works for both 16:9 and square crops.
    - No text, watermarks, logos, or UI elements.
      `.trim();
}
