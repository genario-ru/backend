import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { scenarioScene } from "@/db/schema";

import { scenariosRegistry } from "../registry";
import { scenarioSceneComponentSchema } from "./scenario-scene-component";

export const scenarioSceneSchema = createSelectSchema(scenarioScene).register(
  scenariosRegistry,
  {
    title: "Scenario scene",
    description: "Scenario scene description",
    ref: "ScenarioSceneSchema",
  },
);

export type ScenarioScene = z.infer<typeof scenarioSceneSchema>;

export const scenarioSceneExtendedSchema = scenarioSceneSchema
  .extend({
    components: z.array(scenarioSceneComponentSchema),
  })
  .register(scenariosRegistry, {
    title: "Scenario scene extended",
    description: "Scenario scene extended description",
    ref: "ScenarioSceneExtendedSchema",
  });

export type ScenarioSceneExtended = z.infer<typeof scenarioSceneExtendedSchema>;
