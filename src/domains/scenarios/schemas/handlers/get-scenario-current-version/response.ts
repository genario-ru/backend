import { z } from "@/lib/zod";

import { scenarioVersionExtendedSchema } from "../../entities/scenario-version";

export const getScenarioCurrentVersionResponseSchema = z
  .object({
    data: scenarioVersionExtendedSchema,
  })
  .meta({
    title: "Get scenario current version response",
    description: "Get scenario current version response description",
    ref: "GetScenarioCurrentVersionResponseSchema",
  });

export type GetScenarioCurrentVersionResponse = z.infer<
  typeof getScenarioCurrentVersionResponseSchema
>;
