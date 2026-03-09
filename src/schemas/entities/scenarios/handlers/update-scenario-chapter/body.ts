import { z } from "@/lib/zod";

export const updateScenarioChapterBodySchema = z
  .object({
    name: z.string().optional(),
    description: z.string().nullish(),
    status: z.enum(["pending", "generation", "failed", "ready"]).optional(),
    startTime: z.number().int().optional(),
    endTime: z.number().int().optional(),
  })
  .meta({
    title: "Update scenario chapter body",
    description: "Update scenario chapter body description",
    ref: "UpdateScenarioChapterBodySchema",
  });

export type UpdateScenarioChapterBody = z.infer<
  typeof updateScenarioChapterBodySchema
>;
