import { relations } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { exportFormat } from "@/db/constants/export-format";
import { generationStatus } from "@/db/constants/generation-status";
import { timestamps } from "@/db/constants/timestamps";

import { attachment } from "./attachment";
import { scenarioVersion } from "./scenario-version";
import { user } from "./user";

export const scenarioVersionExport = pgTable("scenario_version_export", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id, { onUpdate: "cascade", onDelete: "cascade" })
    .notNull(),
  scenarioVersionId: uuid("scenario_version_id")
    .references(() => scenarioVersion.id, {
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
  error: text("error"),
  ...timestamps,
});

export const scenarioVersionExportRelations = relations(
  scenarioVersionExport,
  ({ one }) => ({
    user: one(user, {
      fields: [scenarioVersionExport.userId],
      references: [user.id],
    }),
    scenarioVersion: one(scenarioVersion, {
      fields: [scenarioVersionExport.scenarioVersionId],
      references: [scenarioVersion.id],
    }),
    attachment: one(attachment, {
      fields: [scenarioVersionExport.attachmentId],
      references: [attachment.id],
    }),
  }),
);
