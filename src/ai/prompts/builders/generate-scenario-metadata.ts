import template from "@/ai/prompts/templates/generate-scenario-metadata.md";
import type {
  GenerateScenarioMetadataPromptPlatform,
  GenerateScenarioMetadataPromptProps,
} from "@/ai/prompts/types/generate-scenario-metadata";
import { buildContextLines } from "@/ai/utils/build-context-lines";
import { interpolate } from "@/ai/utils/interpolate-template";

export function generateScenarioMetadataPrompt({
  userPrompt,
  context,
  platforms,
}: GenerateScenarioMetadataPromptProps) {
  const {
    scenarioName,
    scenarioDescription,
    scenarioTargetAudience,
    scenarioTemplateName,
    scenarioTemplateDescription,
    scenarioProfileName,
    scenarioProfileDescription,
    scenarioVideoTypeName,
    scenarioVideoDurationName,
    scenarioTones,
  } = context;

  const contextLines = buildContextLines([
    ["Scenario name", scenarioName],
    ["Scenario description", scenarioDescription],
    ["Additional instructions", userPrompt],
    ["Target audience", scenarioTargetAudience],
    ["Template name", scenarioTemplateName],
    ["Template description", scenarioTemplateDescription],
    ["Profile name", scenarioProfileName],
    ["Profile description", scenarioProfileDescription],
    ["Video type", scenarioVideoTypeName],
    ["Video duration", scenarioVideoDurationName],
    ["Tones", scenarioTones?.join(", ")],
  ]);

  return interpolate(template, {
    CONTEXT: contextLines,
    PLATFORMS: buildPlatformsBlock(platforms),
  });
}

function buildPlatformsBlock(
  platforms: GenerateScenarioMetadataPromptPlatform[],
): string {
  if (platforms.length === 0) {
    return "(no platforms — do not generate any items)";
  }

  return platforms
    .map((platform, index) => {
      const lines = buildContextLines([
        ["id", platform.id],
        ["slug", platform.slug],
        ["metadataDetails", platform.metadataDetails],
      ]);

      return `### ${index + 1}. ${platform.name}\n${lines}`;
    })
    .join("\n\n");
}
