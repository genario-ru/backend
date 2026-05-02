import { z } from "@/lib/zod";

export const generateScenarioMetadataParamsSchema = z.object({
  scenarioId: z.uuid(),
});

export type GenerateScenarioMetadataParams = z.infer<
  typeof generateScenarioMetadataParamsSchema
>;
