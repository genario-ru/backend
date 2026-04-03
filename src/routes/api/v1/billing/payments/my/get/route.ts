import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import {
  type GetMyPaymentsResponse,
  getMyPaymentsResponseSchema,
} from "@/schemas/entities/billing/handlers/get-my-payments/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";

export const getMyPaymentsRoute = createHonoApp().basePath(
  "/billing/payments/my",
);

// GET /api/v1/billing/payments/my
getMyPaymentsRoute.get(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "get-my-payments",
    windowMs: 60 * 1000,
    limit: 20,
  }),
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
