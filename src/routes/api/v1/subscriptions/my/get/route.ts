import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import { OpenAPITags } from "@/constants/shared/openapi/tags";
import { db } from "@/db";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import {
  type GetMySubscriptionsResponse,
  getMySubscriptionsResponseSchema,
} from "@/schemas/entities/subscriptions/handlers/get-my-subscriptions/response";
import { createOpenAPIResponse } from "@/utils/shared/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";

export const getMySubscriptionsRoute =
  createHonoApp().basePath("/subscriptons/my");

// GET /api/v1/subscriptons/my
getMySubscriptionsRoute.get(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "get-my-subscriptions",
    windowMs: 60 * 1000,
    limit: 20,
  }),
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Subscriptions],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "My subscriptions retrieved successfully",
        schema: getMySubscriptionsResponseSchema,
      }),
    },
  }),
  async (c) => {
    const user = c.get("user");

    const foundSubscriptions = await db.query.subscription.findMany({
      where: (subscription, { eq }) => eq(subscription.userId, user.id),
      with: { tariff: true },
    });

    return c.json<GetMySubscriptionsResponse>(
      getMySubscriptionsResponseSchema.parse({
        data: foundSubscriptions,
      }),
    );
  },
);
