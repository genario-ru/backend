import { z } from "@/lib/zod";

export const updateScenarioChapterParamsSchema = z.object({
  chapterId: z.uuid(),
});

export type UpdateScenarioChapterParams = z.infer<
  typeof updateScenarioChapterParamsSchema
>;
