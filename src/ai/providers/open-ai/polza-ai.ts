import OpenAI from "openai";

import { envs } from "@/shared/constants/common/envs";

export const polzaAI = new OpenAI({
  baseURL: envs.POLZA_AI_BASE_URL,
  apiKey: envs.POLZA_AI_API_KEY,
});
