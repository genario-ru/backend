import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { idea } from "@/db/schema";

import { ideasListExtendedSchema } from "../../ideas-lists/entities/ideas-list";
import { videoTypeSchema } from "../../video-types/entities/video-type";
import { ideasRegistry } from "../registry";

export const ideaSchema = createSelectSchema(idea)
  .register(ideasRegistry, {
    title: "Idea",
    description: "Idea description",
    ref: "IdeaSchema",
  })
  .extend({
    videoType: videoTypeSchema,
  });

export type Idea = z.infer<typeof ideaSchema>;

export const ideaGeneratedSchema = ideaSchema.pick({
  name: true,
  description: true,
  videoTypeId: true,
});

export type IdeaGenerated = z.infer<typeof ideaGeneratedSchema>;

export const ideaExtendedSchema = ideaSchema
  .extend({
    ideasList: ideasListExtendedSchema,
    videoType: videoTypeSchema,
  })
  .register(ideasRegistry, {
    title: "Idea extended",
    description: "Idea extended description",
    ref: "IdeaExtendedSchema",
  });

export type IdeaExtended = z.infer<typeof ideaExtendedSchema>;
