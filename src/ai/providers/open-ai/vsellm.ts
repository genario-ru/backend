import OpenAI from "openai";

import { env } from "@/env";

export const vsellm = new OpenAI({
  baseURL: env.VSELLM_BASE_URL,
  apiKey: env.VSELLM_API_KEY,
});
