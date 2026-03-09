import { z } from "@/lib/zod";

export const getScenarioChapterParamsSchema = z
  .object({
    chapterId: z.uuid(),
  })
  .meta({
    title: "Get scenario chapter params",
    description: "Get scenario chapter params description",
    ref: "GetScenarioChapterParamsSchema",
  });

export type GetScenarioChapterParams = z.infer<
  typeof getScenarioChapterParamsSchema
>;
