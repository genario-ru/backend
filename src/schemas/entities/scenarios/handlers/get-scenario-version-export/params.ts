import { z } from "@/lib/zod";

export const getScenarioVersionExportParamsSchema = z.object({
  versionId: z.uuid(),
  exportId: z.uuid(),
});

export type GetScenarioVersionExportParams = z.infer<
  typeof getScenarioVersionExportParamsSchema
>;
