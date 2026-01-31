import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const polza = createOpenAICompatible({
  name: "polza",
  baseURL: process.env.POLZA_AI_BASE_URL!,
  apiKey: process.env.POLZA_AI_API_KEY,
  includeUsage: true,
});
