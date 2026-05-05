import { z } from "@/lib/zod";

export const regenerateScenarioMetadataParamsSchema = z.object({
  scenarioId: z.uuid(),
});

export type RegenerateScenarioMetadataParams = z.infer<
  typeof regenerateScenarioMetadataParamsSchema
>;
