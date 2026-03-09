import { createSelectSchema } from "drizzle-zod";

import { scenarioSceneComponentType } from "@/db/schema";
import { z } from "@/lib/zod";

import { scenariosRegistry } from "../registry";

export const scenarioSceneComponentTypeSchema = createSelectSchema(
  scenarioSceneComponentType,
).register(scenariosRegistry, {
  title: "Scenario scene component type",
  description: "Scenario scene component type description",
  ref: "ScenarioSceneComponentTypeSchema",
});

export type ScenarioSceneComponent = z.infer<
  typeof scenarioSceneComponentTypeSchema
>;
