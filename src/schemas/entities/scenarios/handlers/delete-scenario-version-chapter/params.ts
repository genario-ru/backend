import * as z from "zod";

export const deleteScenarioVersionChapterParamsSchema = z.object({
  scenarioId: z.uuid(),
  versionId: z.uuid(),
  chapterId: z.uuid(),
});

export type DeleteScenarioVersionChapterParams = z.infer<
  typeof deleteScenarioVersionChapterParamsSchema
>;
