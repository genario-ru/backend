import { db } from "@/db";
import {
  type GetMySubscriptionsResponse,
  getMySubscriptionsResponseSchema,
} from "@/domains/subscriptions/schemas/handlers/get-my-subscriptions/response";
import { prepareTariffFeatures } from "@/domains/tariffs/utils/prepare-tariff-features";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const getMySubscriptionsRoute =
  createHonoApp().basePath("/subscriptons/my");

// GET /api/v1/subscriptons/my
getMySubscriptionsRoute.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "get-my-subscriptions",
    windowMs: 60 * 1000,
    limit: 30,
  }),
  sessionMiddleware,
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
      orderBy: (subscription, { asc }) => [
        asc(subscription.cycleEndsAt),
        asc(subscription.createdAt),
      ],
      where: (subscription, { eq }) => eq(subscription.userId, user.id),
      with: {
        tariff: {
          with: {
            creditsPackage: true,
          },
        },
      },
    });

    return c.json<GetMySubscriptionsResponse>(
      getMySubscriptionsResponseSchema.parse({
        data: foundSubscriptions.map((subscription) => ({
          ...subscription,
          tariff: {
            ...subscription.tariff,
            features: prepareTariffFeatures(subscription.tariff),
          },
        })),
      }),
    );
  },
);
