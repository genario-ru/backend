export type GenerateScenarioChaptersPromptContext = {
  scenarioName?: string | null;
  scenarioDescription?: string | null;
  scenarioTargetAudience?: string | null;
  scenarioTemplateName?: string | null;
  scenarioTemplateDescription?: string | null;
  scenarioProfileName?: string | null;
  scenarioProfileDescription?: string | null;
  scenarioPlatformNames?: string[];
  scenarioVideoTypeName?: string | null;
  scenarioVideoDurationName?: string | null;
  scenarioMinimumDurationSeconds?: number | null;
  scenarioMaximumDurationSeconds?: number | null;
  scenarioTones?: string[];
};

export type GenerateScenarioChaptersPromptProps = {
  context: GenerateScenarioChaptersPromptContext;
};
