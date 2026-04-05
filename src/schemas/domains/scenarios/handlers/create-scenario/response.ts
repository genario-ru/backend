import { z } from "@/lib/zod";

import { scenarioSchema } from "../../entities/scenario";
export const createScenarioResponseSchema = z
  .object({
    data: scenarioSchema,
  })
  .meta({
    title: "Create scenario response",
    description: "Create scenario response description",
    ref: "CreateScenarioResponseSchema",
  });

export type CreateScenarioResponse = z.infer<
  typeof createScenarioResponseSchema
>;
