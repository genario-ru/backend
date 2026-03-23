import OpenAI from "openai";

import { envs } from "@/constants/common/envs";

export const routerAI = new OpenAI({
  baseURL: envs.ROUTER_AI_BASE_URL,
  apiKey: envs.ROUTER_AI_API_KEY,
});
