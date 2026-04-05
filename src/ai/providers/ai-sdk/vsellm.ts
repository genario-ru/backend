import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

import { envs } from "@/constants/shared/common/envs";

export const vsellm = createOpenAICompatible({
  name: "vsellm",
  baseURL: envs.VSELLM_BASE_URL,
  apiKey: envs.VSELLM_API_KEY,
  includeUsage: true,
  supportsStructuredOutputs: true,
});
