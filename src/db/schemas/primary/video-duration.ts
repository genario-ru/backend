import { relations } from "drizzle-orm";
import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { uniqueSlug } from "@/db/constants/slug";
import { timestamps } from "@/db/constants/timestamps";

import { scenario } from "./scenario";

export const videoDuration = pgTable("video_duration", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  minSeconds: integer("min_seconds").notNull(),
  maxSeconds: integer("max_seconds"),
  ...uniqueSlug,
  ...timestamps,
});

export const videoDurationRelations = relations(videoDuration, ({ many }) => ({
  scenarios: many(scenario),
}));
