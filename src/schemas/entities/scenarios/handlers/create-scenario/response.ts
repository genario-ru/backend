import * as z from "zod";

import { scenarioSchema } from "../../entities/scenario";

export const createScenarioResponseSchema = z.object({
  data: scenarioSchema,
});

export type CreateScenarioResponse = z.infer<
  typeof createScenarioResponseSchema
>;
