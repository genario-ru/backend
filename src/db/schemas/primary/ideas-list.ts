import { relations } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";
import { ideasListToTone } from "../linking/ideas-list-to-tone";
import { ideasListToVideoType } from "../linking/ideas-list-to-video-type";
import { idea } from "./idea";
import { profile } from "./profile";
import { template } from "./template";
import { user } from "./user";

export const ideasList = pgTable("ideas_list", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id, { onUpdate: "cascade", onDelete: "cascade" })
    .notNull(),
  profileId: uuid("profile_id").references(() => profile.id, {
    onUpdate: "cascade",
    onDelete: "set null",
  }),
  templateId: uuid("template_id").references(() => template.id, {
    onUpdate: "cascade",
    onDelete: "set null",
  }),
  name: text("name"),
  description: text("description"),
  targetAudience: text("target_audience"),
  ...timestamps,
});

export const ideaRelations = relations(ideasList, ({ one, many }) => ({
  user: one(user, {
    fields: [ideasList.userId],
    references: [user.id],
  }),
  profile: one(profile, {
    fields: [ideasList.profileId],
    references: [profile.id],
  }),
  template: one(template, {
    fields: [ideasList.templateId],
    references: [template.id],
  }),
  ideas: many(idea),
  ideasListToTone: many(ideasListToTone),
  ideasListToVideoType: many(ideasListToVideoType),
}));
