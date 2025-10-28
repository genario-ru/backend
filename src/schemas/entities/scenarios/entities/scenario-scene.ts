import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { scenarioChapter, scenarioScene } from "@/db/schema";

import { scenarioSceneComponentSchema } from "./scenario-scene-component";

export const scenarioSceneSchema = createSelectSchema(scenarioScene);

export type ScenarioScene = z.infer<typeof scenarioSceneSchema>;

export const scenarioSceneExtendedSchema = scenarioSceneSchema.extend({
  components: z.array(scenarioSceneComponentSchema),
});

export type ScenarioSceneExtended = z.infer<typeof scenarioSceneExtendedSchema>;
