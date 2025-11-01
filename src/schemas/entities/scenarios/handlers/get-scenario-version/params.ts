import * as z from "zod";

export const getScenarioVersionParamsSchema = z.object({
  versionId: z.uuid(),
});

export type GetScenarioVersionParams = z.infer<
  typeof getScenarioVersionParamsSchema
>;
