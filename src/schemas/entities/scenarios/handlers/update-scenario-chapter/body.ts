import * as z from "zod";

export const updateScenarioChapterBodySchema = z.object({
  name: z.string().optional(),
  description: z.string().nullish(),
  status: z.enum(["pending", "generation", "failed", "ready"]).optional(),
  startTime: z.number().int().optional(),
  endTime: z.number().int().optional(),
});

export type UpdateScenarioChapterBody = z.infer<
  typeof updateScenarioChapterBodySchema
>;
