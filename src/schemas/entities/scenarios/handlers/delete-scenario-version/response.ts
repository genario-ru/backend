import { z } from "@/lib/zod";

import { scenarioVersionSchema } from "../../entities/scenario-version";
export const deleteScenarioVersionResponseSchema = z
  .object({
    data: scenarioVersionSchema,
  })
  .meta({
    title: "Delete scenario version response",
    description: "Delete scenario version response description",
    ref: "DeleteScenarioVersionResponseSchema",
  });

export type DeleteScenarioVersionResponse = z.infer<
  typeof deleteScenarioVersionResponseSchema
>;
