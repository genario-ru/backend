import { z } from "@/lib/zod";

export const deleteScenarioChapterParamsSchema = z
  .object({
    chapterId: z.uuid(),
  })
  .meta({
    title: "Delete scenario chapter params",
    description: "Delete scenario chapter params description",
    ref: "DeleteScenarioChapterParamsSchema",
  });

export type DeleteScenarioChapterParams = z.infer<
  typeof deleteScenarioChapterParamsSchema
>;
