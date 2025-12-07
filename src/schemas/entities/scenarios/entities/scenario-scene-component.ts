import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { scenarioSceneComponent } from "@/db/schema";

export const scenarioSceneComponentSchema = createSelectSchema(
  scenarioSceneComponent,
).meta({
  title: "Scenario scene component",
  description: "Scenario scene component description",
  ref: "ScenarioSceneComponentSchema",
});

export type ScenarioSceneComponent = z.infer<
  typeof scenarioSceneComponentSchema
>;
