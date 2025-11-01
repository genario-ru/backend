import * as z from "zod";

import { scenarioChapterSchema } from "../../entities/scenario-chapter";

export const updateScenarioChapterResponseSchema = z.object({
  data: scenarioChapterSchema,
});

export type UpdateScenarioChapterResponse = z.infer<
  typeof updateScenarioChapterResponseSchema
>;
