import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

import { envs } from "@/constants/common/envs";

export const routerAI = createOpenAICompatible({
  name: "router-ai",
  baseURL: envs.ROUTER_AI_BASE_URL,
  apiKey: envs.ROUTER_AI_API_KEY,
  includeUsage: true,
  supportsStructuredOutputs: true,
});
