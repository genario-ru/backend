import * as z from "zod";

import { scenarioChapterSchema } from "../../entities/scenario-chapter";

export const deleteScenarioVersionChapterResponseSchema = z.object({
  data: scenarioChapterSchema,
});

export type DeleteScenarioVersionChapterResponse = z.infer<
  typeof deleteScenarioVersionChapterResponseSchema
>;
