import { z } from "@/lib/zod";

import { scenariosRegistry } from "../../registry";

export const getScenarioVersionParamsSchema = z
  .object({
    versionId: z.uuid(),
  })
  .register(scenariosRegistry, {
    title: "Get scenario version params",
    description: "Get scenario version params description",
    ref: "GetScenarioVersionParamsSchema",
  });

export type GetScenarioVersionParams = z.infer<
  typeof getScenarioVersionParamsSchema
>;
