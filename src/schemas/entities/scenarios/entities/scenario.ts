import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { scenario } from "@/db/schema";

import { platformSchema } from "../../platforms/entities/platform";
import { profileSchema } from "../../profiles/entities/profile";
import { templateSchema } from "../../templates/entities/template";
import { toneSchema } from "../../tones/entities/tone";
import { videoDurationSchema } from "../../video-durations/entities/video-duration";
import { videoTypeSchema } from "../../video-types/entities/video-type";
import { scenarioVersionExtendedSchema } from "./scenario-version";

export const scenarioSchema = createSelectSchema(scenario);

export type Scenario = z.infer<typeof scenarioSchema>;

export const scenarioExtendedSchema = scenarioSchema.extend({
  currentVersion: scenarioVersionExtendedSchema.nullish(),
  profile: profileSchema.nullish(),
  template: templateSchema.nullish(),
  platform: platformSchema.nullish(),
  videoType: videoTypeSchema.nullish(),
  videoDuration: videoDurationSchema.nullish(),
  tones: z.array(toneSchema).nullish(),
});

export type ScenarioExtended = z.infer<typeof scenarioExtendedSchema>;
