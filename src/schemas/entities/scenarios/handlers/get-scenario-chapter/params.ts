import * as z from "zod";

export const getScenarioChapterParamsSchema = z.object({
  chapterId: z.uuid(),
});

export type GetScenarioChapterParams = z.infer<
  typeof getScenarioChapterParamsSchema
>;
