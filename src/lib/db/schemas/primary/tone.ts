import { relations } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";
import { ideasListToTone } from "../linking/ideas-list-to-tone";
import { profileToTone } from "../linking/profile-to-tone";
import { scenarioToTone } from "../linking/scenario-to-tone";

export const tone = pgTable("tone", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  ...timestamps,
});

export const toneRelations = relations(tone, ({ many }) => ({
  profileToTone: many(profileToTone),
  ideasListToTone: many(ideasListToTone),
  scenarioToTone: many(scenarioToTone),
}));
