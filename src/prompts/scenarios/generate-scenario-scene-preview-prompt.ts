type GenerateScenarioPreviewPromptProps = {
  context: {
    scenarioName: string;
    scenarioDescription: string;
    scenarioTargetAudience: string;
  };
};

export function generateScenarioPreviewPrompt({
  context,
}: GenerateScenarioPreviewPromptProps): string {
  const { scenarioName, scenarioDescription, scenarioTargetAudience } = context;

  return `Cinematic preview image for video scenario: "${scenarioName}". ${scenarioDescription} in base64 format. Professional thumbnail quality, no text, single focal point, mood matching the scenario. Target audience: ${scenarioTargetAudience}.`;
}
