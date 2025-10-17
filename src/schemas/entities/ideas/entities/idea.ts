import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { idea } from "@/db/schema";

import { videoTypeSchema } from "../../video-types/entities/video-type";

export const ideaSchema = createSelectSchema(idea);

export type Idea = z.infer<typeof ideaSchema>;

export const ideaExtendedSchema = ideaSchema.extend(
  z.object({
    videoType: videoTypeSchema,
  }).shape,
);

export type IdeaExtended = z.infer<typeof ideaExtendedSchema>;
