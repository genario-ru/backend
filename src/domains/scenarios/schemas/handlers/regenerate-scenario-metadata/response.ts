import { z } from "@/lib/zod";

import { scenarioMetadataExtendedSchema } from "../../entities/scenario-metadata";

export const regenerateScenarioMetadataResponseSchema = z
  .object({
    data: scenarioMetadataExtendedSchema,
  })
  .meta({
    title: "Regenerate scenario metadata response",
    description: "Regenerate scenario metadata response description",
    ref: "RegenerateScenarioMetadataResponseSchema",
  });

export type RegenerateScenarioMetadataResponse = z.infer<
  typeof regenerateScenarioMetadataResponseSchema
>;
