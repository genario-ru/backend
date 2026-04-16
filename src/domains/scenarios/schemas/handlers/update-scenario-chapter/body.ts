import { z } from "@/lib/zod";

export const updateScenarioChapterBodySchema = z
  .object({
    name: z.string().min(3).max(256),
    description: z.string().min(16).max(4096),
    productionStatusId: z.uuid().optional(),
  })
  .meta({
    title: "Update scenario chapter body",
    description: "Update scenario chapter body description",
    ref: "UpdateScenarioChapterBodySchema",
  });

export type UpdateScenarioChapterBody = z.infer<
  typeof updateScenarioChapterBodySchema
>;
