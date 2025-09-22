import { relations } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";
import { platformToVideoType } from "../linking/platform-to-video-type";
import { profileToPlatform } from "../linking/profile-to-platform";
import { scenario } from "./scenario";
import { scenarioVideoReference } from "./scenario-video-reference";

export const platform = pgTable("platform", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  baseUrl: text("base_url"),
  ...timestamps,
});

export const platformRelations = relations(platform, ({ many }) => ({
  scenarios: many(scenario),
  scenarioVideoReferences: many(scenarioVideoReference),
  profileToPlatform: many(profileToPlatform),
  platformToVideoType: many(platformToVideoType),
}));
