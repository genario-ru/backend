import { z } from "@/lib/zod";

export const getScenarioVersionExportsParamsSchema = z.object({
  versionId: z.uuid(),
});

export type GetScenarioVersionExportsParams = z.infer<
  typeof getScenarioVersionExportsParamsSchema
>;
