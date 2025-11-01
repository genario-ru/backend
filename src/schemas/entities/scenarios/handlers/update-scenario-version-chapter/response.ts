import * as z from "zod";

import { scenarioChapterSchema } from "../../entities/scenario-chapter";

export const updateScenarioVersionChapterResponseSchema = z.object({
  data: scenarioChapterSchema,
});

export type UpdateScenarioVersionChapterResponse = z.infer<
  typeof updateScenarioVersionChapterResponseSchema
>;
