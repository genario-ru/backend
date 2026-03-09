import { z } from "@/lib/zod";

import { scenarioSchema } from "../../entities/scenario";
export const deleteScenarioResponseSchema = z
  .object({
    data: scenarioSchema,
  })
  .meta({
    title: "Delete scenario response",
    description: "Delete scenario response description",
    ref: "DeleteScenarioResponseSchema",
  });

export type DeleteScenarioResponse = z.infer<
  typeof deleteScenarioResponseSchema
>;
