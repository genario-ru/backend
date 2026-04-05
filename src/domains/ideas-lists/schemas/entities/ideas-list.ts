import { createSelectSchema } from "drizzle-zod";

import { ideasList } from "@/db/schema";
import { profileSchema } from "@/domains/profiles/schemas/entities/profile";
import { templateSchema } from "@/domains/templates/schemas/entities/template";
import { toneSchema } from "@/domains/tones/schemas/entities/tone";
import { videoTypeSchema } from "@/domains/video-types/schemas/entities/video-type";
import { z } from "@/lib/zod";

export const ideasListSchema = createSelectSchema(ideasList).meta({
  title: "IdeasList",
  description: "IdeasList description",
  ref: "IdeasListSchema",
});

export type IdeasList = z.infer<typeof ideasListSchema>;

export const ideasListExtendedSchema = ideasListSchema
  .extend({
    template: templateSchema.nullable(),
    profile: profileSchema.nullable(),
    tones: z.array(toneSchema),
    videoTypes: z.array(videoTypeSchema),
  })
  .meta({
    title: "Ideas list extended",
    description: "Ideas list extended description",
    ref: "IdeasListExtendedSchema",
  });

export type IdeasListExtended = z.infer<typeof ideasListExtendedSchema>;
