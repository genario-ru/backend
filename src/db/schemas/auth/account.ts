import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";
import { user } from "../primary/user";

export const account = pgTable("account", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" })
    .notNull(),
  accountId: text("account_id").unique().notNull(), // The id of the account as provided by the SSO or equal to userId for credential accounts
  providerId: text("provider_id").notNull(), // The id of the provider as provided by the SSO
  accessToken: text("access_token").unique(), // The access token of the account. Returned by the provider
  accessTokenExpiresAt: timestamp("access_token_expires_at", {
    withTimezone: true,
    mode: "string",
  }), // The time when the access token expires
  refreshToken: text("refresh_token").unique(), // The refresh token of the account. Returned by the provider
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
    withTimezone: true,
    mode: "string",
  }), // The time when the refresh token expires
  scope: text("scope"), // The scope of the account. Returned by the provider
  idToken: text("id_token"), // The id token returned from the provider
  ...timestamps,
});

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
