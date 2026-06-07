import { validator } from "hono-openapi";

import { db } from "@/db";
import { getPaymentParamsSchema } from "@/domains/billing/schemas/handlers/get-payment/params";
import {
  type GetPaymentResponse,
  getPaymentResponseSchema,
} from "@/domains/billing/schemas/handlers/get-payment/response";
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

export const getPaymentRoute = createHonoApp().basePath(
  "/billing/payments/:paymentId",
);

// GET /api/v1/billing/payments/{paymentId}
getPaymentRoute.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "get-payment",
    windowMs: 60 * 1000,
    limit: 30,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Billing],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Payment retrieved successfully",
        schema: getPaymentResponseSchema,
      }),
    },
  }),
  validator("param", getPaymentParamsSchema),
  async (c) => {
    const { paymentId } = c.req.valid("param");
    const user = c.get("user");

    const foundPayment = await db.query.payment.findFirst({
      where: (payment, { and, eq }) =>
        and(eq(payment.id, paymentId), eq(payment.userId, user.id)),
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

    if (!foundPayment) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message:
          "Данный платеж не существует или у вас нет прав на его просмотр",
      });
    }

    const { subscriptionToPayment, creditsBatchToPayment, ...payment } =
      foundPayment;

    return c.json<GetPaymentResponse>(
      getPaymentResponseSchema.parse({
        data: {
          ...payment,
          tariff: subscriptionToPayment?.subscription?.tariff,
          creditsPackage: creditsBatchToPayment?.creditsBatch?.creditsPackage,
        },
      }),
    );
  },
);
