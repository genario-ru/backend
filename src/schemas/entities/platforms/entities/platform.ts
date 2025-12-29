import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { platform } from "@/db/schema";

import { videoTypeSchema } from "../../video-types/entities/video-type";
import { platformsRegistry } from "../registry";

export const platformSchema = createSelectSchema(platform).register(
  platformsRegistry,
  {
    title: "Platform",
    description: "Platform description",
    ref: "PlatformSchema",
  },
);

export type Platform = z.infer<typeof platformSchema>;

export const platformExtendedSchema = platformSchema
  .extend({
    videoTypes: z.array(videoTypeSchema),
  })
  .register(platformsRegistry, {
    title: "Platform extended",
    description: "Platform extended description",
    ref: "PlatformExtendedSchema",
  });

export type PlatformExtended = z.infer<typeof platformExtendedSchema>;
