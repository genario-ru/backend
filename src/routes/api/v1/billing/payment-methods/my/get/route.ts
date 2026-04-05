import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import { OpenAPITags } from "@/constants/shared/openapi/tags";
import { db } from "@/db";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import {
  type GetMyPaymentMethodsResponse,
  getMyPaymentMethodsResponseSchema,
} from "@/schemas/entities/billing/handlers/get-my-payment-methods/response";
import { createOpenAPIResponse } from "@/utils/shared/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";

export const getMyPaymentMethodsRoute = createHonoApp().basePath(
  "/billing/payment-methods/my",
);

// GET /api/v1/billing/payment-methods/my
getMyPaymentMethodsRoute.get(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "get-my-payment-methods",
    windowMs: 60 * 1000,
    limit: 20,
  }),
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
      where: (paymentMethod, { eq }) => eq(paymentMethod.userId, user.id),
    });

    return c.json<GetMyPaymentMethodsResponse>(
      getMyPaymentMethodsResponseSchema.parse({
        data: foundPaymentMethods,
      }),
    );
  },
);
