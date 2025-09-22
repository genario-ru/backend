import { relations } from "drizzle-orm";
import { boolean, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";
import { ideasList } from "./ideas-list";
import { videoType } from "./video-type";

export const ideaVariant = pgTable("idea_variant", {
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
  name: text("name"),
  description: text("description"),
  ...timestamps,
});

export const ideaVariantRelations = relations(ideaVariant, ({ one }) => ({
  ideasList: one(ideasList, {
    fields: [ideaVariant.ideasListId],
    references: [ideasList.id],
  }),
  videoType: one(videoType, {
    fields: [ideaVariant.videoTypeId],
    references: [videoType.id],
  }),
}));
