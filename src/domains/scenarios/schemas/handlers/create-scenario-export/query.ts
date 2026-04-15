import { z } from "@/lib/zod";

export const createScenarioExportQuerySchema = z.object({
  versionId: z.uuid().optional(),
  format: z.string(),
});

export type CreateScenarioExportQuery = z.infer<
  typeof createScenarioExportQuerySchema
>;
