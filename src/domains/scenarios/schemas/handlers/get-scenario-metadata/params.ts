import { z } from "@/lib/zod";

export const getScenarioMetadataParamsSchema = z.object({
  scenarioId: z.uuid(),
});

export type GetScenarioMetadataParams = z.infer<
  typeof getScenarioMetadataParamsSchema
>;
