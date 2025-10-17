import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { scenarioChapter, scenarioSceneComponent } from "@/db/schema";

export const scenarioSceneComponentSchema = createSelectSchema(
  scenarioSceneComponent,
);

export type ScenarioSceneComponent = z.infer<
  typeof scenarioSceneComponentSchema
>;
