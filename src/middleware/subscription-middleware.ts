import { createMiddleware } from "hono/factory";

import { type AuthType } from "@/auth";
import { db } from "@/db";
import {
  type Subscription,
  subscriptionSchema,
} from "@/domains/subscriptions/schemas/entities/subscription";
import {
  type Tariff,
  tariffSchema,
} from "@/domains/tariffs/schemas/entities/tariff";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

type SubscriptionMiddlewareVariables = AuthType & {
  subscription: Subscription;
  tariff: Tariff;
};

export const subscriptionMiddleware = createMiddleware<{
  Variables: SubscriptionMiddlewareVariables;
}>(async (c, next) => {
  const user = c.get("user");

  // Доступ определяется только статусом подписки: даты окончания обрабатывает
  // биллинговый cron, который переводит истекшие подписки в "terminated".
  const foundActiveSubscription = await db.query.subscription.findFirst({
    orderBy: (subscription, { asc }) => [asc(subscription.startsAt)],
    where: (subscription, { and, eq, notInArray }) =>
      and(
        eq(subscription.userId, user.id),
        notInArray(subscription.status, ["pending", "terminated"]),
      ),
    with: {
      tariff: true,
    },
  });

  if (!foundActiveSubscription) {
    return throwAPIError({
      code: APIErrorCode.PaymentRequired,
      message:
        "Для доступа к данному ресурсу необходимо иметь активную подписку",
    });
  }

  const { tariff, ...subscription } = foundActiveSubscription;

  c.set("subscription", subscriptionSchema.parse(subscription));
  c.set("tariff", tariffSchema.parse(tariff));

  return next();
});
