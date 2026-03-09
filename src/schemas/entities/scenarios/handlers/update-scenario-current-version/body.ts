import { z } from "@/lib/zod";

export const updateScenarioCurrentVersionBodySchema = z
  .object({
    currentVersionId: z.uuid(),
  })
  .meta({
    title: "Update scenario current version body",
    description: "Update scenario current version body description",
    ref: "UpdateScenarioCurrentVersionBodySchema",
  });

export type UpdateScenarioCurrentVersionBody = z.infer<
  typeof updateScenarioCurrentVersionBodySchema
>;
