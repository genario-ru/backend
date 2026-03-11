import { relations } from "drizzle-orm";
import { pgTable, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { ideasList } from "../primary/ideas-list";
import { tone } from "../primary/tone";

export const ideasListToTone = pgTable("ideas_list_to_tone", {
  id: uuid("id").defaultRandom().primaryKey(),
  ideasListId: uuid("ideas_list_id")
    .references(() => ideasList.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  toneId: uuid("tone_id")
    .references(() => tone.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  ...timestamps,
});

export const ideasListToToneRelations = relations(
  ideasListToTone,
  ({ one }) => ({
    ideasList: one(ideasList, {
      fields: [ideasListToTone.ideasListId],
      references: [ideasList.id],
    }),
    tone: one(tone, {
      fields: [ideasListToTone.toneId],
      references: [tone.id],
    }),
  }),
);
