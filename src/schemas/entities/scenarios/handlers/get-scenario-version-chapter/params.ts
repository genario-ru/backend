import * as z from "zod";

export const getScenarioVersionChapterParamsSchema = z.object({
  scenarioId: z.uuid(),
  versionId: z.uuid(),
  chapterId: z.uuid(),
});

export type GetScenarioVersionChapterParams = z.infer<
  typeof getScenarioVersionChapterParamsSchema
>;
