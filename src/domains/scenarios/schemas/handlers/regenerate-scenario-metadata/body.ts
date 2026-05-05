import { z } from "@/lib/zod";

export const regenerateScenarioMetadataBodySchema = z
  .object({
    platformId: z.uuid(),
    prompt: z.string().nullish(),
  })
  .meta({
    title: "Regenerate scenario metadata body",
    description: "Regenerate scenario metadata body description",
    ref: "RegenerateScenarioMetadataBodySchema",
  });

export type RegenerateScenarioMetadataBody = z.infer<
  typeof regenerateScenarioMetadataBodySchema
>;
