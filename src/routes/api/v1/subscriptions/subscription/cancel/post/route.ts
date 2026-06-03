import { addDays, addMonths, addYears } from "date-fns";
import { and, eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { db } from "@/db";
import { subscription } from "@/db/schema";
import { cancelSubscriptionParamsSchema } from "@/domains/subscriptions/schemas/handlers/cancel-subscription/params";
import {
  type CancelSubscriptionResponse,
  cancelSubscriptionResponseSchema,
} from "@/domains/subscriptions/schemas/handlers/cancel-subscription/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

export const cancelSubscriptionRoute = createHonoApp().basePath(
  "/subscriptions/:subscriptionId/cancel",
);

// POST /api/v1/subscriptions/{subscriptionId}/cancel
cancelSubscriptionRoute.post(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "cancel-subscription",
    windowMs: 60 * 1000,
    limit: 3,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Subscriptions],
    responses: {
      [HTTPStatusCode.Created]: createOpenAPIResponse({
        description: "Subscription cancelled successfully",
        schema: cancelSubscriptionResponseSchema,
      }),
    },
  }),
  validator("param", cancelSubscriptionParamsSchema),
  async (c) => {
    const { subscriptionId } = c.req.valid("param");
    const user = c.get("user");

    const foundSubscription = await db.query.subscription.findFirst({
      where: (subscription, { and, eq }) =>
        and(
          eq(subscription.id, subscriptionId),
          eq(subscription.userId, user.id),
        ),
      with: {
        tariff: true,
      },
    });

    if (!foundSubscription) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message:
          "Данная подписка не существует или у вас нет прав на ее отмену",
      });
    }

    if (["cancelled", "terminated"].includes(foundSubscription.status)) {
      return throwAPIError({
        code: APIErrorCode.BusinessRuleViolation,
        message: "Вы не можете отменить уже отмененную подписку",
      });
    }

    if (foundSubscription.status === "pending") {
      const currentDate = new Date().toISOString();

      const [terminatedSubscription] = await db
        .update(subscription)
        .set({
          status: "terminated",
          statusUpdatedAt: currentDate,
          endsAt: currentDate,
        })
        .where(
          and(
            eq(subscription.id, subscriptionId),
            eq(subscription.userId, user.id),
          ),
        )
        .returning();

      return c.json<CancelSubscriptionResponse>(
        cancelSubscriptionResponseSchema.parse({
          data: terminatedSubscription,
        }),
        HTTPStatusCode.Ok,
      );
    }

    let endsAt: string | undefined;
    const billingPeriod = foundSubscription.tariff.billingPeriod;
    const durationDays = foundSubscription.tariff.durationDays;

    if (!foundSubscription.startsAt) {
      endsAt = new Date().toISOString();
    } else if (billingPeriod === "month") {
      endsAt = addMonths(foundSubscription.startsAt, 1).toISOString();
    } else if (billingPeriod === "year") {
      endsAt = addYears(foundSubscription.startsAt, 1).toISOString();
    } else if (durationDays && !foundSubscription.endsAt) {
      endsAt = addDays(foundSubscription.startsAt, durationDays).toISOString();
    }

    const [cancelledSubscription] = await db
      .update(subscription)
      .set({
        status: "cancelled",
        endsAt,
      })
      .where(
        and(
          eq(subscription.id, subscriptionId),
          eq(subscription.userId, user.id),
        ),
      )
      .returning();

    return c.json<CancelSubscriptionResponse>(
      cancelSubscriptionResponseSchema.parse({
        data: cancelledSubscription,
      }),
      HTTPStatusCode.Ok,
    );
  },
);
