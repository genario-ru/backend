import { relations } from "drizzle-orm";
import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { account } from "../auth/account";
import { session } from "../auth/session";
import { creditsBatch } from "../billing/credits-batch";
import { payment } from "../billing/payment";
import { subscription } from "../billing/subscription";
import { tariffDiscount } from "../billing/tariff-discount";
import { profilesFromChannelsJob } from "../jobs/profiles-from-channels-job";
import { emailLog } from "../logs/email-log";
import { referralCode } from "../referral/referral-code";
import { referralInvite } from "../referral/referral-invite";
import { notification } from "../secondary/notification";
import { attachment } from "./attachment";
import { exportDocument } from "./export-document";
import { ideasList } from "./ideas-list";
import { profile } from "./profile";
import { scenario } from "./scenario";

export const userRole = pgEnum("user_role", ["user", "admin"]);

export const user = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
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
  impersonatedSessions: many(session, { relationName: "impersonatedSession" }),
  creditsBatches: many(creditsBatch),
  tariffDiscounts: many(tariffDiscount),
  payments: many(payment),
  profiles: many(profile),
  profilesFromChannelsJobs: many(profilesFromChannelsJob),
  ideasLists: many(ideasList),
  scenarios: many(scenario),
  attachments: many(attachment),
  exportDocuments: many(exportDocument),
  subscriptions: many(subscription),
  referralCodes: many(referralCode),
  notifications: many(notification),
  emailLogs: many(emailLog),
  referralInvitesAsSource: many(referralInvite, {
    relationName: "referralSourceUser",
  }),
  referralInvitesAsTarget: many(referralInvite, {
    relationName: "referralTargetUser",
  }),
}));
