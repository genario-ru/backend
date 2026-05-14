import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { subscriptionToCreditsBatch } from "../linking/subscription-to-credits-batch";
import { subscriptionToPayment } from "../linking/subscription-to-payment";
import { user } from "../primary/user";
import { tariff } from "./tariff";

export const subscriptionStatus = pgEnum("subscription_status", [
  "pending", // Подписка создана, но еще не оплачена
  "active", // Подписка активна и последняя оплата прошла успешно
  "overdue", // Подписка активна, но последняя оплата не прошла
  "cancelled", // Подписка активна, но продлеваться она не будет
  "terminated", // Подписка полностью отменена и не будет продлеваться
]);

export const subscription = pgTable(
  "subscription",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => user.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    tariffId: uuid("tariff_id")
      .references(() => tariff.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    // Общая дата начала подписки (соответствует дате начала первого цикла подписки)
    startsAt: timestamp("starts_at", {
      withTimezone: true,
      mode: "string",
    }),
    // Общая дата окончания подписки (нужна, чтобы определять, когда отключать доступ для cancelled подписок)
    endsAt: timestamp("ends_at", {
      withTimezone: true,
      mode: "string",
    }),
    // Дата начала цикла подписки (для отслеживания текущего цикла подписки и корректного расчета следующего цикла)
    cycleStartsAt: timestamp("cycle_starts_at", {
      withTimezone: true,
      mode: "string",
    }),
    // Дата окончания цикла подписки (для отслеживания текущего цикла подписки и корректного расчета следующего цикла)
    cycleEndsAt: timestamp("cycle_ends_at", {
      withTimezone: true,
      mode: "string",
    }),
    // Дата последнего успешного биллинга (для истории)
    lastBilledAt: timestamp("last_billed_at", {
      withTimezone: true,
      mode: "string",
    }),
    // Дата следующего биллинга (для крон джоб, которые будут проверять, нужно сегодня проводить платеж)
    nextBillingAt: timestamp("next_billing_at", {
      withTimezone: true,
      mode: "string",
    }),
    // Количество неудачных попыток проведения платежа (чтобы перевести подписку в статус terminated после определенного количества попыток и ограничить доступ к сервису)
    failedBillingAttempts: integer("failed_billing_attempts")
      .default(0)
      .notNull(),
    status: subscriptionStatus("status").notNull().default("pending"),
    ...timestamps,
  },
  (table) => [
    index("subscription_user_id_starts_at_idx").on(
      table.userId,
      table.startsAt,
    ),
    index("subscription_user_id_cycle_ends_at_created_at_idx").on(
      table.userId,
      table.cycleEndsAt,
      table.createdAt,
    ),
    index("subscription_tariff_id_idx").on(table.tariffId),
  ],
);

export const subscriptionRelations = relations(
  subscription,
  ({ one, many }) => ({
    user: one(user, {
      fields: [subscription.userId],
      references: [user.id],
    }),
    tariff: one(tariff, {
      fields: [subscription.tariffId],
      references: [tariff.id],
    }),
    subscriptionToPayment: many(subscriptionToPayment),
    subscriptionToCreditsBatch: many(subscriptionToCreditsBatch),
  }),
);
