import { z } from "@/lib/zod";

import { scenarioSchema } from "../../entities/scenario";

export const generateScenarioMetadataResponseSchema = z
  .object({
    data: z.object({
      metadataStatus: scenarioSchema.shape.metadataStatus,
    }),
  })
  .meta({
    title: "Generate scenario metadata response",
    description: "Generate scenario metadata response description",
    ref: "GenerateScenarioMetadataResponseSchema",
  });

export type GenerateScenarioMetadataResponse = z.infer<
  typeof generateScenarioMetadataResponseSchema
>;
