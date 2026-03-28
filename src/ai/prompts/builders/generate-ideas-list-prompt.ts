import template from "@/ai/prompts/templates/generate-ideas-list.md";
import { buildContextLines } from "@/ai/utils/build-context-lines";
import { interpolate } from "@/ai/utils/interpolate-template";

type VideoType = { id: string; name: string };

type PreviousIdea = {
  name: string | null;
  description: string | null;
  videoType: VideoType;
};

type GenerateIdeasListPromptProps = {
  userPrompt?: string | null;
  ideasCount?: number | null;
  ideasListName?: string | null;
  ideasListDescription?: string | null;
  ideasListTargetAudience?: string | null;
  ideasListTemplateName?: string | null;
  ideasListTemplateDescription?: string | null;
  ideasListProfileName?: string | null;
  ideasListProfileDescription?: string | null;
  ideasListTones?: string[] | null;
  ideasListVideoTypes?: VideoType[];
  previousGeneratedIdeas?: PreviousIdea[];
};

function buildPreviousIdeasBlock(ideas?: PreviousIdea[] | null): string {
  if (!ideas || ideas.length === 0) return "";
  const list = ideas
    .map(
      (idea, i) =>
        `${i + 1}. "${idea.name}" — ${idea.description ?? "no description"} [${idea.videoType.name}]`,
    )
    .join("\n");
  return `\n## Previously generated ideas (blacklist — produce entirely different topics, angles, and keywords)\n${list}`;
}

function buildTemplateAnchor(templateName?: string | null): string {
  if (!templateName) return "";
  return `\nThe template "${templateName}" defines the core theme — anchor every idea to it, but give each one a distinct creative spin.\n`;
}

export function generateIdeasListPrompt({
  userPrompt,
  ideasCount,
  ideasListName,
  ideasListDescription,
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
    ["User prompt", userPrompt],
    ["Ideas list name", ideasListName],
    ["Ideas list description", ideasListDescription],
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
    VIDEO_TYPES: JSON.stringify(ideasListVideoTypes ?? []),
    PREVIOUS_IDEAS: buildPreviousIdeasBlock(previousGeneratedIdeas),
  });
}
