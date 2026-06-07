import { relations } from "drizzle-orm";
import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { uniqueSlug } from "@/db/constants/slug";
import { timestamps } from "@/db/constants/timestamps";

import { profile } from "./profile";

export const profileType = pgTable("profile_type", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  priority: integer("priority").notNull().default(0),
  ...uniqueSlug(),
  ...timestamps,
});

export const profileTypeRelations = relations(profileType, ({ many }) => ({
  profiles: many(profile),
}));
