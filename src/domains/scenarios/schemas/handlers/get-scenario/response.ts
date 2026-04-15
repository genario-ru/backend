import { z } from "@/lib/zod";

import { scenarioExtendedSchema } from "../../entities/scenario";

export const getScenarioResponseSchema = z
  .object({
    data: scenarioExtendedSchema,
  })
  .meta({
    title: "Get scenario response",
    description: "Get scenario response description",
    ref: "GetScenarioResponseSchema",
  });

export type GetScenarioResponse = z.infer<typeof getScenarioResponseSchema>;
