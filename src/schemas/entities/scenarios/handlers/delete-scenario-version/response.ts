import { z } from "@/lib/zod";

import { scenarioVersionSchema } from "../../entities/scenario-version";
import { scenariosRegistry } from "../../registry";

export const deleteScenarioVersionResponseSchema = z
  .object({
    data: scenarioVersionSchema,
  })
  .register(scenariosRegistry, {
    title: "Delete scenario version response",
    description: "Delete scenario version response description",
    ref: "DeleteScenarioVersionResponseSchema",
  });

export type DeleteScenarioVersionResponse = z.infer<
  typeof deleteScenarioVersionResponseSchema
>;
