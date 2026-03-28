import template from "@/ai/prompts/templates/generate-scenario-scene-preview.md";
import { interpolate } from "@/ai/utils/interpolate-template";

type GenerateScenarioScenePreviewPromptProps = {
  scenarioName: string | null;
  scenarioDescription: string | null;
  scenarioTargetAudience: string | null;
  chapterName: string | null;
  chapterDescription: string | null;
  sceneName: string | null;
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
    sceneStartTime,
    sceneEndTime,
  } = props;

  const parts: string[] = [];

  if (sceneName) parts.push(`Scene: "${sceneName}".`);
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
  return interpolate(template, {
    SCENE_CONTEXT: buildSceneContext(props),
  });
}
