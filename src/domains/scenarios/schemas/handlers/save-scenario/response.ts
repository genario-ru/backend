import { z } from "@/lib/zod";

import { scenarioSchema } from "../../entities/scenario";

export const saveScenarioResponseSchema = z
  .object({
    data: scenarioSchema,
  })
  .meta({
    title: "Save scenario response",
    description: "Save scenario response description",
    ref: "SaveScenarioResponseSchema",
  });

export type SaveScenarioResponse = z.infer<typeof saveScenarioResponseSchema>;
