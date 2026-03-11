import { createSelectSchema } from "drizzle-zod";

import { scenarioVersionExport } from "@/db/schema";
import { z } from "@/lib/zod";

export const scenarioVersionExportSchema = createSelectSchema(
  scenarioVersionExport,
).meta({
  title: "Scenario version export",
  description: "Scenario version export description",
  ref: "ScenarioVersionExportSchema",
});

export type ScenarioVersionExport = z.infer<typeof scenarioVersionExportSchema>;

export const scenarioVersionExportWithUrlSchema = scenarioVersionExportSchema
  .extend({
    url: z.string().nullable(),
  })
  .meta({
    title: "Scenario version export with url",
    description: "Scenario version export with url description",
    ref: "ScenarioVersionExportWithUrlSchema",
  });

export type ScenarioVersionExportWithUrl = z.infer<
  typeof scenarioVersionExportWithUrlSchema
>;
