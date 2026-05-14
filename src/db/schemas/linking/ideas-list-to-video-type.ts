import { relations } from "drizzle-orm";
import { index, pgTable, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { ideasList } from "../primary/ideas-list";
import { videoType } from "../primary/video-type";

export const ideasListToVideoType = pgTable(
  "ideas_list_to_video_type",
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
    ...timestamps,
  },
  (table) => [
    index("ideas_list_to_video_type_ideas_list_id_idx").on(table.ideasListId),
    index("ideas_list_to_video_type_video_type_id_ideas_list_id_idx").on(
      table.videoTypeId,
      table.ideasListId,
    ),
  ],
);

export const ideasListToVideoTypeRelations = relations(
  ideasListToVideoType,
  ({ one }) => ({
    ideasList: one(ideasList, {
      fields: [ideasListToVideoType.ideasListId],
      references: [ideasList.id],
    }),
    videoType: one(videoType, {
      fields: [ideasListToVideoType.videoTypeId],
      references: [videoType.id],
    }),
  }),
);
