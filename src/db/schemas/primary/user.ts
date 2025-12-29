import { relations } from "drizzle-orm";
import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";
import { account } from "../auth/account";
import { session } from "../auth/session";
import { creditsBatch } from "../billing/credits-batch";
import { subscription } from "../billing/subscription";
import { attachment } from "./attachment";
import { ideasList } from "./ideas-list";
import { profile } from "./profile";
import { scenario } from "./scenario";

export const userRole = pgEnum("role", ["user", "admin"]);

export const user = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").unique(),
  email: text("email").unique().notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  phone: text("phone").unique(),
  phoneVerified: boolean("phone_verified").default(false).notNull(),
  name: text("name").notNull(),
  image: text("image"),
  role: userRole("role").default("user").notNull(),
  banned: boolean("banned").default(false).notNull(),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires", {
    withTimezone: true,
    mode: "string",
  }),
  ...timestamps,
});

export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  sessions: many(session, { relationName: "session" }),
  impersonatedSessions: many(session, { relationName: "impersonated_session" }),
  creditsBatches: many(creditsBatch),
  profiles: many(profile),
  ideasLists: many(ideasList),
  scenarios: many(scenario),
  attachments: many(attachment),
  subscriptions: many(subscription),
}));
