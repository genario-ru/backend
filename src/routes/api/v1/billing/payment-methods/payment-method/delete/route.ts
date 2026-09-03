import { and, eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { db } from "@/db";
import { paymentMethod } from "@/db/schema";
import { deletePaymentMethodParamsSchema } from "@/domains/billing/schemas/handlers/delete-payment-method/params";
import {
  type DeletePaymentMethodResponse,
  deletePaymentMethodResponseSchema,
} from "@/domains/billing/schemas/handlers/delete-payment-method/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { paymentsKillSwitchMiddleware } from "@/middleware/payments-kill-switch-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

export const deletePaymentMethodRoute = createHonoApp().basePath(
  "/billing/payment-methods/:paymentMethodId",
);

// DELETE /api/v1/billing/payment-methods/{paymentMethodId}
deletePaymentMethodRoute.delete(
  "/",
  rateLimitMiddleware({
    keyPrefix: "delete-payment-method",
    windowMs: 3 * 1000,
    limit: 1,
  }),
  sessionMiddleware,
  paymentsKillSwitchMiddleware,
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Billing],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Payment method deleted successfully",
        schema: deletePaymentMethodResponseSchema,
      }),
    },
  }),
  validator("param", deletePaymentMethodParamsSchema),
  async (c) => {
    const { paymentMethodId } = c.req.valid("param");
    const user = c.get("user");

    const foundPaymentMethod = await db.query.paymentMethod.findFirst({
      where: (paymentMethod, { and, eq }) =>
        and(
          eq(paymentMethod.id, paymentMethodId),
          eq(paymentMethod.userId, user.id),
        ),
    });

    if (!foundPaymentMethod) {
      throw throwAPIError({
        code: APIErrorCode.NotFound,
        message:
          "Данный метод оплаты не существует или у вас нет прав на его удаление",
      });
    }

    const [deletedPaymentMethod] = await db
      .delete(paymentMethod)
      .where(
        and(
          eq(paymentMethod.id, paymentMethodId),
          eq(paymentMethod.userId, user.id),
        ),
      )
      .returning();

    return c.json<DeletePaymentMethodResponse>(
      deletePaymentMethodResponseSchema.parse({
        data: deletedPaymentMethod,
      }),
    );
  },
);
