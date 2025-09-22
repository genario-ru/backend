import { relations } from "drizzle-orm";
import { pgTable, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";
import { platform } from "../primary/platform";
import { profile } from "../primary/profile";

export const profileToPlatform = pgTable("profile_to_platform", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id")
    .references(() => profile.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  platformId: uuid("platform_id")
    .references(() => platform.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  ...timestamps,
});

export const profileToPlatformRelations = relations(
  profileToPlatform,
  ({ one }) => ({
    profile: one(profile, {
      fields: [profileToPlatform.profileId],
      references: [profile.id],
    }),
    platform: one(platform, {
      fields: [profileToPlatform.platformId],
      references: [platform.id],
    }),
  }),
);
