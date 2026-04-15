import { z } from "@/lib/zod";

export const getScenarioCurrentVersionQuerySchema = z.object({
  versionId: z.uuid().optional(),
});

export type GetScenarioCurrentVersionQuery = z.infer<
  typeof getScenarioCurrentVersionQuerySchema
>;
