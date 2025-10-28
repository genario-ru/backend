import * as z from "zod";

import { scenarioSchema } from "../../entities/scenario";

export const deleteScenarioResponseSchema = z.object({
  data: scenarioSchema,
});

export type DeleteScenarioResponse = z.infer<
  typeof deleteScenarioResponseSchema
>;
