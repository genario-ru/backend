import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { ideasList } from "@/db/schema";

import { profileSchema } from "../../profiles/entities/profile";
import { toneSchema } from "../../tones/entities/tone";
import { videoTypeSchema } from "../../video-types/entities/video-type";

export const ideasListSchema = createSelectSchema(ideasList).meta({
  title: "IdeasList",
  description: "IdeasList description",
  ref: "IdeasListSchema",
});

export type IdeasList = z.infer<typeof ideasListSchema>;

export const ideasListExtendedSchema = ideasListSchema
  .extend({
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
