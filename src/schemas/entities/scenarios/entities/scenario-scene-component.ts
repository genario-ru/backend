import { scenarioChapter, scenarioSceneComponent } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

export const scenarioSceneComponentSchema = createSelectSchema(scenarioSceneComponent);

export type ScenarioSceneComponent = z.infer<typeof scenarioSceneComponentSchema>;
