import * as z from "zod";

import { scenarioExtendedSchema } from "../../entities/scenario";

export const getScenarioResponseSchema = z.object({
  data: scenarioExtendedSchema,
});

export type GetScenarioResponse = z.infer<typeof getScenarioResponseSchema>;
