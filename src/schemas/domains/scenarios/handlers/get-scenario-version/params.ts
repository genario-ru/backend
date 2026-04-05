import { z } from "@/lib/zod";

export const getScenarioVersionParamsSchema = z.object({
  versionId: z.uuid(),
});

export type GetScenarioVersionParams = z.infer<
  typeof getScenarioVersionParamsSchema
>;
