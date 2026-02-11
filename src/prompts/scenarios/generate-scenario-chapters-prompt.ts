type GenerateScenarioChaptersPromptProps = {
  context: {
    scenarioName?: string | null;
    scenarioDescription?: string | null;
    scenarioTargetAudience?: string | null;
    scenarioTemplateName?: string | null;
    scenarioTemplateDescription?: string | null;
    scenarioProfileName?: string | null;
    scenarioProfileDescription?: string | null;
    scenarioPlatformName?: string | null;
    scenarioVideoTypeName?: string | null;
    scenarioVideoDurationName?: string | null;
    scenarioMinimumDurationSeconds?: number | null;
    scenarioMaximumDurationSeconds?: number | null;
    scenarioTones?: string[];
  };
};

export function generateScenarioChaptersPrompt({
  context,
}: GenerateScenarioChaptersPromptProps) {
  const {
    scenarioName,
    scenarioDescription,
    scenarioTargetAudience,
    scenarioTemplateName,
    scenarioTemplateDescription,
    scenarioProfileName,
    scenarioProfileDescription,
    scenarioPlatformName,
    scenarioVideoTypeName,
    scenarioVideoDurationName,
    scenarioMinimumDurationSeconds,
    scenarioMaximumDurationSeconds,
    scenarioTones,
  } = context;

  return `
    Generate scenario chapters.

    Context:
    Scenario name: "${scenarioName}";
    Scenario description: "${scenarioDescription}";
    Target audience: "${scenarioTargetAudience}";
    Template name: "${scenarioTemplateName}";
    Template description: "${scenarioTemplateDescription}";
    Profile name: "${scenarioProfileName}";
    Profile description: "${scenarioProfileDescription}";
    Platform: "${scenarioPlatformName}";
    Video type: "${scenarioVideoTypeName}";
    Video duration: "${scenarioVideoDurationName}";
    Tones: ${scenarioTones?.join(", ")};
    Minimum duration seconds: ${scenarioMinimumDurationSeconds};
    Maximum duration seconds: ${scenarioMaximumDurationSeconds};

    Instructions:
    - Do NOT invent new tones or options.
    - Do NOT return explanations or comments.
    - Do NOT wrap the response in markdown.
    - Each chapter must have a unique angle.
    - Chapters must be in chronological order and not overlap.
    - Return valid JSON only.
  `;
}
