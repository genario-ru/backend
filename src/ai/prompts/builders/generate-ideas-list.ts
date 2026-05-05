import template from "@/ai/prompts/templates/generate-ideas-list.md";
import type {
  GenerateIdeasListPromptProps,
  PreviousIdea,
} from "@/ai/prompts/types/generate-ideas-list";
import { buildContextLines } from "@/ai/utils/build-context-lines";
import { interpolate } from "@/ai/utils/interpolate-template";

export function generateIdeasListPrompt({
  userPrompt,
  ideasCount,
  ideasListPrompt,
  ideasListTargetAudience,
  ideasListTemplateName,
  ideasListTemplateDescription,
  ideasListProfileName,
  ideasListProfileDescription,
  ideasListTones,
  ideasListVideoTypes,
  previousGeneratedIdeas,
}: GenerateIdeasListPromptProps) {
  const contextLines = buildContextLines([
    ["Ideas list prompt", ideasListPrompt],
    ["Additional instructions", userPrompt],
    ["Target audience", ideasListTargetAudience],
    ["Template name", ideasListTemplateName],
    ["Template description", ideasListTemplateDescription],
    ["Profile name", ideasListProfileName],
    ["Profile description", ideasListProfileDescription],
    ["Tones", ideasListTones?.join(", ")],
    ["Video types", ideasListVideoTypes?.map((vt) => vt.name).join(", ")],
  ]);

  return interpolate(template, {
    IDEAS_COUNT: String(ideasCount ?? 0),
    TEMPLATE_ANCHOR: buildTemplateAnchor(ideasListTemplateName),
    CONTEXT: contextLines,
    PREVIOUS_IDEAS: buildPreviousIdeasBlock(previousGeneratedIdeas),
    VIDEO_TYPES: JSON.stringify(ideasListVideoTypes ?? []),
  });
}

function buildPreviousIdeasBlock(ideas?: PreviousIdea[] | null): string {
  if (!ideas || ideas.length === 0) return "";
  const list = ideas
    .map(
      (idea, i) =>
        `${i + 1}. "${idea.name}" — ${idea.description ?? "no description"} [${idea.videoType.name}]`,
    )
    .join("\n");

  return `## Previously generated ideas (blacklist — produce entirely different topics, angles, and keywords)\n${list}\n`;
}

function buildTemplateAnchor(templateName?: string | null): string {
  if (!templateName) return "";

  return `\nThe template "${templateName}" defines the core theme — anchor every idea to it, but give each one a distinct creative spin.\n`;
}
