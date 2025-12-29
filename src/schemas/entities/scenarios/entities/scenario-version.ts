import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { scenarioVersion } from "@/db/schema";

import { platformSchema } from "../../platforms/entities/platform";
import { profileSchema } from "../../profiles/entities/profile";
import { toneSchema } from "../../tones/entities/tone";
import { videoDurationSchema } from "../../video-durations/entities/video-duration";
import { videoTypeSchema } from "../../video-types/entities/video-type";
import { scenariosRegistry } from "../registry";
import { scenarioChapterSchema } from "./scenario-chapter";

export const scenarioVersionSchema = createSelectSchema(
  scenarioVersion,
).register(scenariosRegistry, {
  title: "Scenario version",
  description: "Scenario version description",
  ref: "ScenarioVersionSchema",
});

export type ScenarioVersion = z.infer<typeof scenarioVersionSchema>;

export const scenarioVersionExtendedSchema = scenarioVersionSchema
  .extend({
    profile: profileSchema.nullable(),
    platform: platformSchema.nullable(),
    videoType: videoTypeSchema.nullable(),
    videoDuration: videoDurationSchema.nullable(),
    tones: z.array(toneSchema).nullable(),
    scenarioChapters: z.array(scenarioChapterSchema).nullable(),
  })
  .register(scenariosRegistry, {
    title: "Scenario version extended",
    description: "Scenario version extended description",
    ref: "ScenarioVersionExtendedSchema",
  });

export type ScenarioVersionExtended = z.infer<
  typeof scenarioVersionExtendedSchema
>;
