import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

import { env } from "@/env";

export const vsellm = createOpenAICompatible({
  name: "vsellm",
  baseURL: env.VSELLM_BASE_URL,
  apiKey: env.VSELLM_API_KEY,
  includeUsage: true,
  supportsStructuredOutputs: true,
});
