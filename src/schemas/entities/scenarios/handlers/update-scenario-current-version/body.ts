import * as z from "zod";

export const updateScenarioCurrentVersionBodySchema = z.object({
  currentVersionId: z.string().uuid(),
});

export type UpdateScenarioCurrentVersionBody = z.infer<
  typeof updateScenarioCurrentVersionBodySchema
>;
