import * as z from "zod";

export const updateScenarioVersionChapterParamsSchema = z.object({
  scenarioId: z.uuid(),
  versionId: z.uuid(),
  chapterId: z.uuid(),
});

export type UpdateScenarioVersionChapterParams = z.infer<
  typeof updateScenarioVersionChapterParamsSchema
>;
