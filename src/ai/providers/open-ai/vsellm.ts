import OpenAI from "openai";

import { envs } from "@/shared/constants/common/envs";

export const vsellm = new OpenAI({
  baseURL: envs.VSELLM_BASE_URL,
  apiKey: envs.VSELLM_API_KEY,
});
