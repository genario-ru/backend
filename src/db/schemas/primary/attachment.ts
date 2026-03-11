import { relations } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { ideasListExport } from "./ideas-list-export";
import { profileAttachment } from "./profile-attachment";
import { scenarioScenePreview } from "./scenario-scene-preview";
import { scenarioVersionExport } from "./scenario-version-export";
import { user } from "./user";

export const attachment = pgTable("attachment", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id, { onUpdate: "cascade", onDelete: "cascade" })
    .notNull(),
  key: text("key").notNull(),
  bucketName: text("bucket_name").notNull(),
  mimeType: text("mime_type").notNull(),
  ...timestamps,
});

export const attachmentRelations = relations(attachment, ({ one, many }) => ({
  user: one(user, {
    fields: [attachment.userId],
    references: [user.id],
  }),
  profileAttachments: many(profileAttachment),
  ideasListExports: many(ideasListExport),
  scenarioVersionExports: many(scenarioVersionExport),
  scenarioScenePreviews: many(scenarioScenePreview, {
    relationName: "previewOriginal",
  }),
  scenarioScenePreviewsCompressed: many(scenarioScenePreview, {
    relationName: "previewCompressed",
  }),
}));
