import { db } from "@/db";
import {
  type GetMyPaymentMethodsResponse,
  getMyPaymentMethodsResponseSchema,
} from "@/domains/billing/schemas/handlers/get-my-payment-methods/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const getMyPaymentMethodsRoute = createHonoApp().basePath(
  "/billing/payment-methods/my",
);

// GET /api/v1/billing/payment-methods/my
getMyPaymentMethodsRoute.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "get-my-payment-methods",
    windowMs: 60 * 1000,
    limit: 30,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Billing],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "My payment methods retrieved successfully",
        schema: getMyPaymentMethodsResponseSchema,
      }),
    },
  }),
  async (c) => {
    const user = c.get("user");

    const foundPaymentMethods = await db.query.paymentMethod.findMany({
      orderBy: (paymentMethod, { desc }) => [desc(paymentMethod.createdAt)],
      where: (paymentMethod, { and, eq }) =>
        and(
          eq(paymentMethod.userId, user.id),
          eq(paymentMethod.status, "active"),
        ),
    });

    return c.json<GetMyPaymentMethodsResponse>(
      getMyPaymentMethodsResponseSchema.parse({
        data: foundPaymentMethods,
      }),
    );
  },
);
