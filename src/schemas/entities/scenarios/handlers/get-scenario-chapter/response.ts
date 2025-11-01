import * as z from "zod";

import { scenarioChapterExtendedSchema } from "../../entities/scenario-chapter";

export const getScenarioChapterResponseSchema = z.object({
  data: scenarioChapterExtendedSchema,
});

export type GetScenarioChapterResponse = z.infer<
  typeof getScenarioChapterResponseSchema
>;
