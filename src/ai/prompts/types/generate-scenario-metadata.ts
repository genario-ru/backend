export type GenerateScenarioMetadataPromptPlatform = {
  id: string;
  name: string;
  slug: string;
  metadataDetails?: string | null;
};

export type GenerateScenarioMetadataPromptContext = {
  scenarioName?: string | null;
  scenarioDescription?: string | null;
  scenarioTargetAudience?: string | null;
  scenarioTemplateName?: string | null;
  scenarioTemplateDescription?: string | null;
  scenarioProfileName?: string | null;
  scenarioProfileDescription?: string | null;
  scenarioVideoTypeName?: string | null;
  scenarioVideoDurationName?: string | null;
  scenarioTones?: string[];
};

export type GenerateScenarioMetadataPromptProps = {
  context: GenerateScenarioMetadataPromptContext;
  platforms: GenerateScenarioMetadataPromptPlatform[];
};
