import { relations } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";
import { profileToPlatform } from "../linking/profile-to-platform";
import { profileToTone } from "../linking/profile-to-tone";
import { ideasList } from "./ideas-list";
import { profileAttachment } from "./profile-attachment";
import { profileType } from "./profile-type";
import { scenario } from "./scenario";
import { user } from "./user";

export const profile = pgTable("profile", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id, { onUpdate: "cascade", onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  targetAudience: text("target_audience"),
  typeId: uuid("type_id").references(() => profileType.id, {
    onUpdate: "cascade",
    onDelete: "set null",
  }),
  ...timestamps,
});

export const profileRelations = relations(profile, ({ one, many }) => ({
  user: one(user, {
    fields: [profile.userId],
    references: [user.id],
  }),
  type: one(profileType, {
    fields: [profile.typeId],
    references: [profileType.id],
  }),
  ideasLists: many(ideasList),
  scenarios: many(scenario),
  attachments: many(profileAttachment),
  profileToPlatform: many(profileToPlatform),
  profileToTone: many(profileToTone),
}));
