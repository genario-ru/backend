import * as z from "zod";

import { scenariosRegistry } from "../../registry";

export const updateScenarioCurrentVersionBodySchema = z
  .object({
    currentVersionId: z.uuid(),
  })
  .register(scenariosRegistry, {
    title: "Update scenario current version body",
    description: "Update scenario current version body description",
    ref: "UpdateScenarioCurrentVersionBodySchema",
  });

export type UpdateScenarioCurrentVersionBody = z.infer<
  typeof updateScenarioCurrentVersionBodySchema
>;
