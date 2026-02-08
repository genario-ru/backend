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
    Generate ${ideasCount} video ideas.

    Context:
    Ideas list name: "${name}";
    Ideas list description: "${description}";
    Target audience: "${targetAudience}";
    Template name: "${templateName}";
    Template description: "${templateDescription}";
    Profile name: "${profileName}";
    Profile description: "${profileDescription}";
    Tones: ${tones?.join(", ")};
    Video types: ${videoTypes?.map(({ id, name }) => `- ${id}: ${name}`).join("\n")}.

    User prompt: "${userPrompt}";

    Instructions:
    - Do NOT invent new tones or video types;
    - Do NOT reuse the same video type for all ideas;
    - Do NOT return explanations or comments;
    - Do NOT wrap the response in markdown or other formatting;
    - Do NOT ask any additional questions;
    - Follow the provided output schema exactly;
    - Each idea must have a unique angle;
    - Title must be short (max 80 chars);
    - Description must explain the core hook and be detailed;
    - Choose the MOST relevant video type for each idea;
    - If you see that some field value has value null, undefined, empty string, etc., just ignore such field;
  `;

  return prompt;
}
