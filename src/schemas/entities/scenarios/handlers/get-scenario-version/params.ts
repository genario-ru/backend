import { z } from "@/lib/zod";

export const getScenarioVersionParamsSchema = z
  .object({
    versionId: z.uuid(),
  })
  .meta({
    title: "Get scenario version params",
    description: "Get scenario version params description",
    ref: "GetScenarioVersionParamsSchema",
  });

export type GetScenarioVersionParams = z.infer<
  typeof getScenarioVersionParamsSchema
>;
