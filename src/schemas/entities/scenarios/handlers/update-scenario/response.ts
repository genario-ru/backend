import * as z from "zod";

import { scenarioSchema } from "../../entities/scenario";

export const updateScenarioResponseSchema = z.object({
  data: scenarioSchema,
});

export type UpdateScenarioResponse = z.infer<
  typeof updateScenarioResponseSchema
>;
