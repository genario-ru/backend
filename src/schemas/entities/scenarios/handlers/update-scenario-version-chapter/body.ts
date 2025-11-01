import * as z from "zod";

export const updateScenarioVersionChapterBodySchema = z.object({
  name: z.string().optional(),
  description: z.string().nullish(),
  status: z.enum(["pending", "generation", "failed", "ready"]).optional(),
  startTime: z.number().int().optional(),
  endTime: z.number().int().optional(),
});

export type UpdateScenarioVersionChapterBody = z.infer<
  typeof updateScenarioVersionChapterBodySchema
>;
