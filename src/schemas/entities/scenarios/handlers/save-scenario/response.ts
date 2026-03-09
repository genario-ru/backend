import { z } from "@/lib/zod";

import { scenarioSchema } from "../../entities/scenario";
import { scenariosRegistry } from "../../registry";

export const saveScenarioResponseSchema = z
  .object({
    data: scenarioSchema,
  })
  .register(scenariosRegistry, {
    title: "Save scenario response",
    description: "Save scenario response description",
    ref: "SaveScenarioResponseSchema",
  });

export type SaveScenarioResponse = z.infer<typeof saveScenarioResponseSchema>;
