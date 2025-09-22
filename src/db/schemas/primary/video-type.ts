import { relations } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";
import { ideasListToVideoType } from "../linking/ideas-list-to-video-type";
import { platformToVideoType } from "../linking/platform-to-video-type";
import { ideaVariant } from "./idea-variant";
import { scenario } from "./scenario";

export const videoType = pgTable("video_type", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  ...timestamps,
});

export const videoTypeRelations = relations(videoType, ({ many }) => ({
  ideaVariants: many(ideaVariant),
  scenarios: many(scenario),
  platformToVideoType: many(platformToVideoType),
  ideasListToVideoType: many(ideasListToVideoType),
}));
