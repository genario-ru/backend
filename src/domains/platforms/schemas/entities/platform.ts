import { createSelectSchema } from "drizzle-zod";

import { platform } from "@/db/schema";
import { videoTypeSchema } from "@/domains/video-types/schemas/entities/video-type";
import { z } from "@/lib/zod";

export const platformSchema = createSelectSchema(platform).meta({
  title: "Platform",
  description: "Platform description",
  ref: "PlatformSchema",
});

export type Platform = z.infer<typeof platformSchema>;

export const platformExtendedSchema = platformSchema
  .extend({
    videoTypes: z.array(videoTypeSchema),
  })
  .meta({
    title: "Platform extended",
    description: "Platform extended description",
    ref: "PlatformExtendedSchema",
  });

export type PlatformExtended = z.infer<typeof platformExtendedSchema>;
