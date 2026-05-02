import { z } from "@/lib/zod";

import { scenarioSchema } from "../../entities/scenario";
import { scenarioMetadataExtendedSchema } from "../../entities/scenario-metadata";

export const getScenarioMetadataResponseSchema = z
  .object({
    data: z.object({
      status: scenarioSchema.shape.metadataStatus,
      items: z.array(scenarioMetadataExtendedSchema),
    }),
  })
  .meta({
    title: "Get scenario metadata response",
    description: "Get scenario metadata response description",
    ref: "GetScenarioMetadataResponseSchema",
  });

export type GetScenarioMetadataResponse = z.infer<
  typeof getScenarioMetadataResponseSchema
>;
