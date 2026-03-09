import { z } from "@/lib/zod";

import { scenariosRegistry } from "../../registry";

export const saveScenarioBodySchema = z
  .object({
    saved: z.boolean(),
  })
  .register(scenariosRegistry, {
    title: "Save scenario body",
    description: "Save scenario body description",
    ref: "SaveScenarioBodySchema",
  });

export type SaveScenarioBody = z.infer<typeof saveScenarioBodySchema>;
