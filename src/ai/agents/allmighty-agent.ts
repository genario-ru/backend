import { ToolLoopAgent } from "ai";

import { envs } from "@/constants/common/envs";

import { polzaAI } from "../providers/polza-ai";

export const allmightyAgent = new ToolLoopAgent({
  model: polzaAI(envs.POLZA_AI_STRUCTURED_OUTPUT_MODEL),
  instructions:
    "You are a helpful assistant designed to help with tasks related to the process of video content creation",
  tools: {
    // Your tools here
  },
});
