import { db } from "@/db";
import {
  type GetMyPaymentsResponse,
  getMyPaymentsResponseSchema,
} from "@/domains/billing/schemas/handlers/get-my-payments/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const getMyPaymentsRoute = createHonoApp().basePath(
  "/billing/payments/my",
);

// GET /api/v1/billing/payments/my
getMyPaymentsRoute.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "get-my-payments",
    windowMs: 60 * 1000,
    limit: 30,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Billing],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "My payments retrieved successfully",
        schema: getMyPaymentsResponseSchema,
      }),
    },
  }),
  async (c) => {
    const user = c.get("user");

    const foundPayments = await db.query.payment.findMany({
      orderBy: (payment, { desc }) => [desc(payment.createdAt)],
      where: (payment, { eq }) => eq(payment.userId, user.id),
      with: {
        paymentMethod: true,
        subscriptionToPayment: {
          with: {
            subscription: {
              with: {
                tariff: true,
              },
            },
          },
        },
        creditsBatchToPayment: {
          with: {
            creditsBatch: {
              with: {
                creditsPackage: true,
              },
            },
          },
        },
      },
    });

    const preparedFoundPayments = foundPayments.map(
      ({ subscriptionToPayment, creditsBatchToPayment, ...payment }) => ({
        ...payment,
        subscription: subscriptionToPayment?.subscription,
        creditsBatch: creditsBatchToPayment?.creditsBatch,
      }),
    );

    return c.json<GetMyPaymentsResponse>(
      getMyPaymentsResponseSchema.parse({
        data: preparedFoundPayments,
      }),
    );
  },
);
