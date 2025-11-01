import * as z from "zod";

import { scenarioChapterExtendedSchema } from "../../entities/scenario-chapter";

export const getScenarioVersionChapterResponseSchema = z.object({
  data: scenarioChapterExtendedSchema,
});

export type GetScenarioVersionChapterResponse = z.infer<
  typeof getScenarioVersionChapterResponseSchema
>;
