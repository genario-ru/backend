import * as z from "zod";

import { scenarioSchema } from "../../entities/scenario";

export const updateScenarioCurrentVersionResponseSchema = z.object({
  data: scenarioSchema,
});

export type UpdateScenarioCurrentVersionResponse = z.infer<
  typeof updateScenarioCurrentVersionResponseSchema
>;
