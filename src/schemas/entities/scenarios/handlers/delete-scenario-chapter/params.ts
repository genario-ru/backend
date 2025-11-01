import * as z from "zod";

export const deleteScenarioChapterParamsSchema = z.object({
  chapterId: z.uuid(),
});

export type DeleteScenarioChapterParams = z.infer<
  typeof deleteScenarioChapterParamsSchema
>;
