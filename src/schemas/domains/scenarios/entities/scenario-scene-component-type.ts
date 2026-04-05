import { createSelectSchema } from "drizzle-zod";

import { scenarioSceneComponentType } from "@/db/schema";
import { z } from "@/lib/zod";

export const scenarioSceneComponentTypeSchema = createSelectSchema(
  scenarioSceneComponentType,
).meta({
  title: "Scenario scene component type",
  description: "Scenario scene component type description",
  ref: "ScenarioSceneComponentTypeSchema",
});

export type ScenarioSceneComponent = z.infer<
  typeof scenarioSceneComponentTypeSchema
>;
