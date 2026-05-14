import { relations } from "drizzle-orm";
import { index, pgTable, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { profile } from "../primary/profile";
import { tone } from "../primary/tone";

export const profileToTone = pgTable(
  "profile_to_tone",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .references(() => profile.id, {
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
  },
  (table) => [
    index("profile_to_tone_profile_id_tone_id_idx").on(
      table.profileId,
      table.toneId,
    ),
  ],
);

export const profileToToneRelations = relations(profileToTone, ({ one }) => ({
  profile: one(profile, {
    fields: [profileToTone.profileId],
    references: [profile.id],
  }),
  tone: one(tone, {
    fields: [profileToTone.toneId],
    references: [tone.id],
  }),
}));
