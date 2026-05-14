import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

import { env } from "@/env";

export const polzaAI = createOpenAICompatible({
  name: "polza-ai",
  baseURL: env.POLZA_AI_BASE_URL,
  apiKey: env.POLZA_AI_API_KEY,
  includeUsage: true,
  supportsStructuredOutputs: true,
});
