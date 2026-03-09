import { createSelectSchema } from "drizzle-zod";

import { scenario } from "@/db/schema";
import { z } from "@/lib/zod";

import { platformSchema } from "../../platforms/entities/platform";
import { profileSchema } from "../../profiles/entities/profile";
import { templateSchema } from "../../templates/entities/template";
import { toneSchema } from "../../tones/entities/tone";
import { videoDurationSchema } from "../../video-durations/entities/video-duration";
import { videoTypeSchema } from "../../video-types/entities/video-type";
import { scenariosRegistry } from "../registry";
import { scenarioVersionExtendedSchema } from "./scenario-version";

export const scenarioSchema = createSelectSchema(scenario).register(
  scenariosRegistry,
  {
    title: "Scenario",
    description: "Scenario description",
    ref: "ScenarioSchema",
  },
);

export type Scenario = z.infer<typeof scenarioSchema>;

export const scenarioExtendedSchema = scenarioSchema
  .extend({
    currentVersion: scenarioVersionExtendedSchema.nullish(),
    profile: profileSchema.nullish(),
    template: templateSchema.nullish(),
    platform: platformSchema.nullish(),
    videoType: videoTypeSchema.nullish(),
    videoDuration: videoDurationSchema.nullish(),
    tones: z.array(toneSchema).nullish(),
  })
  .register(scenariosRegistry, {
    title: "Scenario extended",
    description: "Scenario extended description",
    ref: "ScenarioExtendedSchema",
  });

export type ScenarioExtended = z.infer<typeof scenarioExtendedSchema>;
