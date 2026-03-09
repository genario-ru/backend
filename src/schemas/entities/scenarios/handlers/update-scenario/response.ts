import { z } from "@/lib/zod";

import { scenarioSchema } from "../../entities/scenario";
import { scenariosRegistry } from "../../registry";

export const updateScenarioResponseSchema = z
  .object({
    data: scenarioSchema,
  })
  .register(scenariosRegistry, {
    title: "Update scenario response",
    description: "Update scenario response description",
    ref: "UpdateScenarioResponseSchema",
  });

export type UpdateScenarioResponse = z.infer<
  typeof updateScenarioResponseSchema
>;
