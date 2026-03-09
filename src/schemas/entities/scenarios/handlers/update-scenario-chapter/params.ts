import { z } from "@/lib/zod";

export const updateScenarioChapterParamsSchema = z
  .object({
    chapterId: z.uuid(),
  })
  .meta({
    title: "Update scenario chapter params",
    description: "Update scenario chapter params description",
    ref: "UpdateScenarioChapterParamsSchema",
  });

export type UpdateScenarioChapterParams = z.infer<
  typeof updateScenarioChapterParamsSchema
>;
