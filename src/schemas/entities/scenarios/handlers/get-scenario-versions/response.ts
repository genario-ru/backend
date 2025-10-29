import * as z from "zod";

import { scenarioVersionSchema } from "../../entities/scenario-version";

export const getScenarioVersionsResponseSchema = z.object({
  data: z.array(scenarioVersionSchema),
});

export type GetScenarioVersionsResponse = z.infer<
  typeof getScenarioVersionsResponseSchema
>;
