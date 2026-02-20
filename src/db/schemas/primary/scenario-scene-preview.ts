import { relations } from "drizzle-orm";
import { pgEnum, pgTable, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { attachment } from "./attachment";
import { scenarioScene } from "./scenario-scene";

export const scenarioScenePreviewStatus = pgEnum(
  "scenario_scene_preview_status",
  ["pending", "generation", "failed", "ready"],
);

export const scenarioScenePreview = pgTable("scenario_scene_preview", {
  id: uuid("id").defaultRandom().primaryKey(),
  scenarioSceneId: uuid("scenario_scene_id")
    .references(() => scenarioScene.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  attachmentId: uuid("attachment_id").references(() => attachment.id, {
    onUpdate: "cascade",
    onDelete: "cascade",
  }),
  status: scenarioScenePreviewStatus("status").default("pending").notNull(),
  ...timestamps,
});

export const scenarioScenePreviewRelations = relations(
  scenarioScenePreview,
  ({ one }) => ({
    scenarioScene: one(scenarioScene, {
      fields: [scenarioScenePreview.scenarioSceneId],
      references: [scenarioScene.id],
    }),
    attachment: one(attachment, {
      fields: [scenarioScenePreview.attachmentId],
      references: [attachment.id],
    }),
  }),
);
