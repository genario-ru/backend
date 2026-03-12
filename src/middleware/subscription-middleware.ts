import { and, eq, gt, isNull, or } from "drizzle-orm";
import { createMiddleware } from "hono/factory";

import { type AuthType } from "@/auth";
import { db } from "@/db";
import { APIErrorCode } from "@/schemas/common/api-error";
import {
  type Subscription,
  subscriptionSchema,
} from "@/schemas/entities/subscriptions/entities/subscription";
import {
  type Tariff,
  tariffSchema,
} from "@/schemas/entities/tariffs/entities/tariff";
import { throwAPIError } from "@/utils/server/throw-api-error";

type SubscriptionMiddlewareVariables = AuthType & {
  subscription: Subscription;
  tariff: Tariff;
};

export const subscriptionMiddleware = createMiddleware<{
  Variables: SubscriptionMiddlewareVariables;
}>(async (c, next) => {
  const user = c.get("user");
  const now = new Date().toISOString();

  const foundSubscription = await db.query.subscription.findFirst({
    where: (subscription) =>
      and(
        eq(subscription.userId, user.id),
        eq(subscription.status, "active"),
        or(isNull(subscription.endsAt), gt(subscription.endsAt, now)),
      ),
    with: {
      tariff: true,
    },
  });

  if (!foundSubscription) {
    return throwAPIError({
      code: APIErrorCode.Forbidden,
      message:
        "Для доступа к данному ресурсу необходимо иметь активную подписку",
    });
  }

  const { tariff, ...subscription } = foundSubscription;

  c.set("subscription", subscriptionSchema.parse(subscription));
  c.set("tariff", tariffSchema.parse(tariff));

  return next();
});
