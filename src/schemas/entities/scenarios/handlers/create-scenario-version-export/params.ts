import { z } from "@/lib/zod";

export const createScenarioVersionExportParamsSchema = z.object({
  versionId: z.uuid(),
});

export type CreateScenarioVersionExportParams = z.infer<
  typeof createScenarioVersionExportParamsSchema
>;
