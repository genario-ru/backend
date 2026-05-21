import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { platformToVideoType } from "../linking/platform-to-video-type";
import { profileToPlatform } from "../linking/profile-to-platform";
import { scenarioToPlatform } from "../linking/scenario-to-platform";
import { profileChannel } from "./profile-channel";
import { scenarioVideoReference } from "./scenario-video-reference";

export const platform = pgTable("platform", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  details: text("details"),
  metadataDetails: text("metadata_details"),
  logoUrl: text("logo_url"),
  baseUrl: text("base_url"),
  urlRegex: text("url_regex"),
  channelUrlRegex: text("channel_url_regex"),
  hasAutoImport: boolean("has_auto_import").notNull().default(false),
  priority: integer("priority").notNull().default(0),
  ...timestamps,
});

export const platformRelations = relations(platform, ({ many }) => ({
  scenarioVideoReferences: many(scenarioVideoReference),
  profileChannels: many(profileChannel),
  profileToPlatform: many(profileToPlatform),
  platformToVideoType: many(platformToVideoType),
  scenarioToPlatform: many(scenarioToPlatform),
}));
