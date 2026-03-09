import { z } from "@/lib/zod";

import { scenarioVersionExtendedSchema } from "../../entities/scenario-version";
export const getScenarioVersionResponseSchema = z
  .object({
    data: scenarioVersionExtendedSchema,
  })
  .meta({
    title: "Get scenario version response",
    description: "Get scenario version response description",
    ref: "GetScenarioVersionResponseSchema",
  });

export type GetScenarioVersionResponse = z.infer<
  typeof getScenarioVersionResponseSchema
>;
