import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { ideasList } from "./ideas-list";
import { videoType } from "./video-type";

export const idea = pgTable(
  "idea",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ideasListId: uuid("ideas_list_id")
      .references(() => ideasList.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      })
      .notNull(),
    videoTypeId: uuid("video_type_id")
      .references(() => videoType.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      })
      .notNull(),
    saved: boolean("saved").notNull().default(false),
    liked: boolean("liked"),
    name: text("name").notNull(),
    description: text("description").notNull(),
    reason: text("reason"),
    hook: text("hook"),
    complexity: integer("complexity").notNull().default(0),
    potential: integer("potential").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    index("idea_ideas_list_id_created_at_idx").on(
      table.ideasListId,
      table.createdAt,
    ),
  ],
);

export const ideaRelations = relations(idea, ({ one }) => ({
  ideasList: one(ideasList, {
    fields: [idea.ideasListId],
    references: [ideasList.id],
  }),
  videoType: one(videoType, {
    fields: [idea.videoTypeId],
    references: [videoType.id],
  }),
}));
