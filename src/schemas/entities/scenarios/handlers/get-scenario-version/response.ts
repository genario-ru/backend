import * as z from "zod";

import { scenarioVersionExtendedSchema } from "../../entities/scenario-version";

export const getScenarioVersionResponseSchema = z.object({
  data: scenarioVersionExtendedSchema,
});

export type GetScenarioVersionResponse = z.infer<
  typeof getScenarioVersionResponseSchema
>;
