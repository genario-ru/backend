import { z } from "@/lib/zod";

import { scenarioSchema } from "../../entities/scenario";

export const updateScenarioResponseSchema = z
  .object({
    data: scenarioSchema,
  })
  .meta({
    title: "Update scenario response",
    description: "Update scenario response description",
    ref: "UpdateScenarioResponseSchema",
  });

export type UpdateScenarioResponse = z.infer<
  typeof updateScenarioResponseSchema
>;
