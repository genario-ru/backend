import * as z from "zod";

import { scenarioChapterSchema } from "../../entities/scenario-chapter";

export const deleteScenarioChapterResponseSchema = z.object({
  data: scenarioChapterSchema,
});

export type DeleteScenarioChapterResponse = z.infer<
  typeof deleteScenarioChapterResponseSchema
>;
