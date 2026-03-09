import { createSelectSchema } from "drizzle-zod";

import { idea } from "@/db/schema";
import { z } from "@/lib/zod";

import { ideasListExtendedSchema } from "../../ideas-lists/entities/ideas-list";
import { videoTypeSchema } from "../../video-types/entities/video-type";
export const ideaSchema = createSelectSchema(idea).meta({
  title: "Idea",
  description: "Idea description",
  ref: "IdeaSchema",
});

export type Idea = z.infer<typeof ideaSchema>;

export const ideaGeneratedSchema = ideaSchema.pick({
  name: true,
  description: true,
  reason: true,
  videoTypeId: true,
});

export type IdeaGenerated = z.infer<typeof ideaGeneratedSchema>;

export const ideaExtendedSchema = ideaSchema
  .extend({
    ideasList: ideasListExtendedSchema,
    videoType: videoTypeSchema,
  })
  .meta({
    title: "Idea extended",
    description: "Idea extended description",
    ref: "IdeaExtendedSchema",
  });

export type IdeaExtended = z.infer<typeof ideaExtendedSchema>;
