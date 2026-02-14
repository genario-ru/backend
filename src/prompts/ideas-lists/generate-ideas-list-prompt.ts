type GenerateIdeasListPromptProps = {
  userPrompt?: string | null;
  context: {
    name?: string | null;
    description?: string | null;
    targetAudience?: string | null;
    templateName?: string | null;
    templateDescription?: string | null;
    profileName?: string | null;
    profileDescription?: string | null;
    tones?: string[];
    videoTypes?: {
      id: string;
      name: string;
    }[];
  };
  settings: {
    ideasCount: number;
  };
};

export function generateIdeasListPrompt({
  userPrompt,
  settings,
  context,
}: GenerateIdeasListPromptProps) {
  const {
    name,
    description,
    targetAudience,
    templateName,
    templateDescription,
    profileName,
    profileDescription,
    tones,
    videoTypes,
  } = context;

  const { ideasCount } = settings;

  const prompt = `
    # Instructions:
    - Generate ${ideasCount} video ideas based on provided context and data.

    # Context:
    - Ideas list user prompt: "${userPrompt}";
    - Ideas list name: "${name}";
    - Ideas list description: "${description}";
    - Ideas list description: "${description}";
    - Ideas list target audience: "${targetAudience}";
    - Ideas list template name: "${templateName}";
    - Ideas list template description: "${templateDescription}";
    - Ideas list profile name: "${profileName}";
    - Ideas list profile description: "${profileDescription}";
    - Ideas list tones: ${tones?.join(", ")};
    - Ideas list video types: ${videoTypes?.map((videoType) => videoType.name).join("\n")};

    # Data:
    - Available video types: ${JSON.stringify(videoTypes)};

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
