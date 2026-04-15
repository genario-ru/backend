import { z } from "@/lib/zod";

export const getScenarioExportsQuerySchema = z.object({
  versionId: z.uuid().optional(),
});

export type GetScenarioExportsQuery = z.infer<
  typeof getScenarioExportsQuerySchema
>;
