import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { scenarioSceneComponentType } from "@/db/schema";

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
