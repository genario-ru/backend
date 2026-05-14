import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

import { env } from "@/env";

export const routerAI = createOpenAICompatible({
  name: "router-ai",
  baseURL: env.ROUTER_AI_BASE_URL,
  apiKey: env.ROUTER_AI_API_KEY,
  includeUsage: true,
  supportsStructuredOutputs: true,
});
