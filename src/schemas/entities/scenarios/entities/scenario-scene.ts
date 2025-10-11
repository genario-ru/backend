import { scenarioChapter, scenarioScene } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";
import { scenarioSceneComponentSchema } from "./scenario-scene-component";

export const scenarioSceneSchema = createSelectSchema(scenarioScene);

export type ScenarioScene = z.infer<typeof scenarioSceneSchema>;

export const scenarioSceneExtendedSchema = scenarioSceneSchema.extend(
  z.object({
    components: z.array(scenarioSceneComponentSchema),
  }).shape,
);

export type ScenarioSceneExtended = z.infer<
  typeof scenarioSceneExtendedSchema
>;
