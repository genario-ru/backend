import { ideasList } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";
import { profileSchema } from "../../profiles/entities/profile";
import { toneSchema } from "../../tones/entities/tone";
import { videoTypeSchema } from "../../video-types/entities/video-type";

export const ideasListSchema = createSelectSchema(ideasList);

export type IdeasList = z.infer<typeof ideasListSchema>;

export const ideasListExtendedSchema = ideasListSchema.merge(
  z.object({
    profile: profileSchema.nullable(),
    tones: z.array(toneSchema),
    videoTypes: z.array(videoTypeSchema),
  }),
);

export type IdeasListExtended = z.infer<typeof ideasListExtendedSchema>;
