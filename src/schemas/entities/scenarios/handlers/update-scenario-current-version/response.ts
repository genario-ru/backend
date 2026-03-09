import { z } from "@/lib/zod";

import { scenarioSchema } from "../../entities/scenario";
export const updateScenarioCurrentVersionResponseSchema = z
  .object({
    data: scenarioSchema,
  })
  .meta({
    title: "Update scenario current version response",
    description: "Update scenario current version response description",
    ref: "UpdateScenarioCurrentVersionResponseSchema",
  });

export type UpdateScenarioCurrentVersionResponse = z.infer<
  typeof updateScenarioCurrentVersionResponseSchema
>;
