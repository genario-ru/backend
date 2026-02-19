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
  ideasListVideoTypes?: {
    id: string;
    name: string;
  }[];
  previousGeneratedIdeas?: {
    name: string | null;
    description: string | null;
    videoType: {
      id: string;
      name: string;
    };
  }[];
};

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
  const prompt = `
    # Instructions:
    - Generate ${ideasCount} video ideas based on the provided context and data.
    - Ideas must be unique and different from the previous generated ideas.

    # Context:
    - Ideas list user prompt: "${userPrompt}";
    - Ideas list name: "${ideasListName}";
    - Ideas list description: "${ideasListDescription}";
    - Ideas list target audience: "${ideasListTargetAudience}";
    - Ideas list template name: "${ideasListTemplateName}";
    - Ideas list template description: "${ideasListTemplateDescription}";
    - Ideas list profile name: "${ideasListProfileName}";
    - Ideas list profile description: "${ideasListProfileDescription}";
    - Ideas list tones: ${ideasListTones?.join(", ")};
    - Ideas list video types: ${ideasListVideoTypes?.map((videoType) => videoType.name).join(", ")};

    # Data:
    - Available video types: ${JSON.stringify(ideasListVideoTypes)};
    - Previous generated ideas: ${JSON.stringify(previousGeneratedIdeas)};

    # Rules:
    - Each idea must have a unique angle;
    - Title must be short (max 80 chars);
    - Description must explain the core hook and be detailed;
    - Choose the MOST relevant video type for each idea.

    # Constraints:
    - Do NOT invent new tones or video types;
    - Do NOT reuse the same video type for all ideas;
  `;

  return prompt;
}
