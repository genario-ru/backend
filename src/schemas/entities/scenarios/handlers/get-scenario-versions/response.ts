import { z } from "@/lib/zod";

import { scenarioVersionSchema } from "../../entities/scenario-version";
export const getScenarioVersionsResponseSchema = z
  .object({
    data: z.array(scenarioVersionSchema),
  })
  .meta({
    title: "Get scenario versions response",
    description: "Get scenario versions response description",
    ref: "GetScenarioVersionsResponseSchema",
  });

export type GetScenarioVersionsResponse = z.infer<
  typeof getScenarioVersionsResponseSchema
>;
