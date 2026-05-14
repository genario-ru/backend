import OpenAI from "openai";

import { env } from "@/env";

export const polzaAI = new OpenAI({
  baseURL: env.POLZA_AI_BASE_URL,
  apiKey: env.POLZA_AI_API_KEY,
});
