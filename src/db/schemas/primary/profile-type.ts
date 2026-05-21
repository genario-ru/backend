import { relations } from "drizzle-orm";
import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { profile } from "./profile";

export const profileType = pgTable("profile_type", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  priority: integer("priority").notNull().default(0),
  ...timestamps,
});

export const profileTypeRelations = relations(profileType, ({ many }) => ({
  profiles: many(profile),
}));
