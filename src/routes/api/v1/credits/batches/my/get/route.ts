import { db } from "@/db";
import {
  type GetMyCreditsBatchesResponse,
  getMyCreditsBatchesResponseSchema,
} from "@/domains/credits/schemas/handlers/get-my-credits-batches/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const getMyCreditsBatchesRoute = createHonoApp().basePath(
  "/credits/batches/my",
);

// GET /api/v1/credits/batches/my
getMyCreditsBatchesRoute.get(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "get-my-credits-batches",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Credits],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "My credits batches retrieved successfully",
        schema: getMyCreditsBatchesResponseSchema,
      }),
    },
  }),
  async (c) => {
    const user = c.get("user");

    const foundCreditsBatches = await db.query.creditsBatch.findMany({
      orderBy: (creditsBatch, { desc }) => [
        desc(creditsBatch.expiresAt),
        desc(creditsBatch.createdAt),
      ],
      where: (creditsBatch, { eq, and, gt }) =>
        and(
          eq(creditsBatch.userId, user.id),
          gt(creditsBatch.remainingAmount, 0),
          eq(creditsBatch.status, "active"),
        ),
      with: {
        subscriptionToCreditsBatch: {
          with: {
            subscription: true,
          },
        },
        creditsPackage: true,
      },
    });

    const filteredFoundCreditsBatches = foundCreditsBatches.filter(
      (creditsBatch) => {
        if (
          creditsBatch.expiresAt &&
          new Date(creditsBatch.expiresAt) < new Date()
        ) {
          return false;
        }

        return true;
      },
    );

    const preparedFoundCreditsBatches = filteredFoundCreditsBatches.map(
      ({ subscriptionToCreditsBatch, ...creditsBatch }) => ({
        ...creditsBatch,
        subscription: subscriptionToCreditsBatch?.subscription,
      }),
    );

    return c.json<GetMyCreditsBatchesResponse>(
      getMyCreditsBatchesResponseSchema.parse({
        data: preparedFoundCreditsBatches,
      }),
    );
  },
);
