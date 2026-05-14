import OpenAI from "openai";

import { env } from "@/env";

export const routerAI = new OpenAI({
  baseURL: env.ROUTER_AI_BASE_URL,
  apiKey: env.ROUTER_AI_API_KEY,
});
