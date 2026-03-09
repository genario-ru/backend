import { createSelectSchema } from "drizzle-zod";

import { scenarioScenePreview } from "@/db/schema";
import { z } from "@/lib/zod";

import { scenariosRegistry } from "../registry";

export const scenarioScenePreviewSchema = createSelectSchema(
  scenarioScenePreview,
)
  .extend({
    url: z.string().nullable(),
    urlCompressed: z.string().nullable(),
  })
  .register(scenariosRegistry, {
    title: "Scenario scene preview",
    description: "Scenario scene preview description",
    ref: "ScenarioScenePreviewSchema",
  });

export type ScenarioScenePreview = z.infer<typeof scenarioScenePreviewSchema>;
