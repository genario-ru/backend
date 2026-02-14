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
    Instructions:
    - Generate scenario chapters based on provided context and data.

    Context:
    - Scenario name: "${scenarioName}";
    - Scenario description: "${scenarioDescription}";
    - Scenario target audience: "${scenarioTargetAudience}";
    - Scenario template name: "${scenarioTemplateName}";
    - Scenario template description: "${scenarioTemplateDescription}";
    - Scenario profile name: "${scenarioProfileName}";
    - Scenario profile description: "${scenarioProfileDescription}";
    - Scenario platform name: "${scenarioPlatformName}";
    - Scenario video type name: "${scenarioVideoTypeName}";
    - Scenario video duration name: "${scenarioVideoDurationName}";
    - Scenario minimum duration seconds: ${scenarioMinimumDurationSeconds};
    - Scenario maximum duration seconds: ${scenarioMaximumDurationSeconds};
    - Scenario tones: ${scenarioTones?.join(", ")}.

    Rules:
    - First chapter must start at ${scenarioMinimumDurationSeconds}, last chapter must end at ${scenarioMaximumDurationSeconds};
    - Each chapter must have a unique angle;
    - Chapters must be in chronological order and not overlap.
  `;
}
