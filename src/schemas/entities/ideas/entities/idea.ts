import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { idea } from "@/db/schema";

import { videoTypeSchema } from "../../video-types/entities/video-type";

export const ideaSchema = createSelectSchema(idea).meta({
  title: "Idea",
  description: "Idea description",
  ref: "IdeaSchema",
});

export type Idea = z.infer<typeof ideaSchema>;

export const ideaExtendedSchema = ideaSchema
  .extend({
    videoType: videoTypeSchema,
  })
  .meta({
    title: "Idea extended",
    description: "Idea extended description",
    ref: "IdeaExtendedSchema",
  });

export type IdeaExtended = z.infer<typeof ideaExtendedSchema>;
