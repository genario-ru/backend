import { relations } from "drizzle-orm";
import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { uniqueSlug } from "@/db/constants/slug";
import { timestamps } from "@/db/constants/timestamps";

import { ideasListToVideoType } from "../linking/ideas-list-to-video-type";
import { platformToVideoType } from "../linking/platform-to-video-type";
import { idea } from "./idea";
import { scenario } from "./scenario";

export const videoType = pgTable("video_type", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  priority: integer("priority").notNull().default(0),
  ...uniqueSlug,
  ...timestamps,
});

export const videoTypeRelations = relations(videoType, ({ many }) => ({
  ideas: many(idea),
  scenarios: many(scenario),
  platformToVideoType: many(platformToVideoType),
  ideasListToVideoType: many(ideasListToVideoType),
}));
