import { relations } from "drizzle-orm";
import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { scenario } from "./scenario";

export const videoDuration = pgTable("video_duration", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  minSeconds: integer("min_seconds").notNull(),
  maxSeconds: integer("max_seconds"),
  ...timestamps,
});

export const videoDurationRelations = relations(videoDuration, ({ many }) => ({
  scenarios: many(scenario),
}));
