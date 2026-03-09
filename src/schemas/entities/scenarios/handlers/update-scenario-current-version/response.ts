import { z } from "@/lib/zod";

import { scenarioSchema } from "../../entities/scenario";
import { scenariosRegistry } from "../../registry";

export const updateScenarioCurrentVersionResponseSchema = z
  .object({
    data: scenarioSchema,
  })
  .register(scenariosRegistry, {
    title: "Update scenario current version response",
    description: "Update scenario current version response description",
    ref: "UpdateScenarioCurrentVersionResponseSchema",
  });

export type UpdateScenarioCurrentVersionResponse = z.infer<
  typeof updateScenarioCurrentVersionResponseSchema
>;
