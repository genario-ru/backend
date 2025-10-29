import * as z from "zod";

import { scenarioVersionSchema } from "../../entities/scenario-version";

export const deleteScenarioVersionResponseSchema = z.object({
  data: scenarioVersionSchema,
});

export type DeleteScenarioVersionResponse = z.infer<
  typeof deleteScenarioVersionResponseSchema
>;
