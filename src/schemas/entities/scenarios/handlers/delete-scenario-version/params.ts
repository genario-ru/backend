import { z } from "@/lib/zod";

export const deleteScenarioVersionParamsSchema = z
  .object({
    versionId: z.uuid(),
  })
  .meta({
    title: "Delete scenario version params",
    description: "Delete scenario version params description",
    ref: "DeleteScenarioVersionParamsSchema",
  });

export type DeleteScenarioVersionParams = z.infer<
  typeof deleteScenarioVersionParamsSchema
>;
