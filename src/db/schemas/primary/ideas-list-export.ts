import { relations } from "drizzle-orm";
import { boolean, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { exportFormat } from "@/db/constants/export-format";
import { generationStatus } from "@/db/constants/generation-status";
import { timestamps } from "@/db/constants/timestamps";

import { attachment } from "./attachment";
import { ideasList } from "./ideas-list";
import { user } from "./user";

export const ideasListExport = pgTable("ideas_list_export", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id, { onUpdate: "cascade", onDelete: "cascade" })
    .notNull(),
  ideasListId: uuid("ideas_list_id")
    .references(() => ideasList.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  attachmentId: uuid("attachment_id").references(() => attachment.id, {
    onUpdate: "cascade",
    onDelete: "set null",
  }),
  format: exportFormat("format").notNull(),
  status: generationStatus("status").default("pending").notNull(),
  savedOnly: boolean("saved_only").default(false).notNull(),
  error: text("error"),
  ...timestamps,
});

export const ideasListExportRelations = relations(
  ideasListExport,
  ({ one }) => ({
    user: one(user, {
      fields: [ideasListExport.userId],
      references: [user.id],
    }),
    ideasList: one(ideasList, {
      fields: [ideasListExport.ideasListId],
      references: [ideasList.id],
    }),
    attachment: one(attachment, {
      fields: [ideasListExport.attachmentId],
      references: [attachment.id],
    }),
  }),
);
