import { validator } from "hono-openapi";

import { upgradeSubscription } from "@/domains/billing/services/upgrade-subscription";
import { upgradeSubscriptionBodySchema } from "@/domains/subscriptions/schemas/handlers/upgrade-subscription/body";
import {
  type UpgradeSubscriptionResponse,
  upgradeSubscriptionResponseSchema,
} from "@/domains/subscriptions/schemas/handlers/upgrade-subscription/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const upgradeSubscriptionRoute = createHonoApp().basePath(
  "/subscriptions/upgrade",
);

// POST /api/v1/subscriptions/upgrade
upgradeSubscriptionRoute.post(
  "/",
  rateLimitMiddleware({
    keyPrefix: "upgrade-subscription",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Subscriptions],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Subscription upgraded successfully",
        schema: upgradeSubscriptionResponseSchema,
      }),
    },
  }),
  validator("json", upgradeSubscriptionBodySchema),
  async (c) => {
    const user = c.get("user");
    const { newTariffId } = c.req.valid("json");

    const { createdSubscription } = await upgradeSubscription({
      userId: user.id,
      tariffId: newTariffId,
    });

    return c.json<UpgradeSubscriptionResponse>(
      upgradeSubscriptionResponseSchema.parse({
        data: createdSubscription,
      }),
    );
  },
);
