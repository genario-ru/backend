import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

import { envs } from "@/shared/constants/common/envs";

export const polzaAI = createOpenAICompatible({
  name: "polza-ai",
  baseURL: envs.POLZA_AI_BASE_URL,
  apiKey: envs.POLZA_AI_API_KEY,
  includeUsage: true,
  supportsStructuredOutputs: true,
});
