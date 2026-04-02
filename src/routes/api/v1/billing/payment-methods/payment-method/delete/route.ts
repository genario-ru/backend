import { and, eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { paymentMethod } from "@/db/schema";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { deletePaymentMethodParamsSchema } from "@/schemas/entities/billing/handlers/delete-payment-method/params";
import {
  type DeletePaymentMethodResponse,
  deletePaymentMethodResponseSchema,
} from "@/schemas/entities/billing/handlers/delete-payment-method/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";
import { throwAPIError } from "@/utils/server/throw-api-error";

export const deletePaymentMethodRoute = createHonoApp().basePath(
  "/billing/payment-methods/:paymentMethodId",
);

// DELETE /api/v1/billing/payment-methods/{paymentMethodId}
deletePaymentMethodRoute.delete(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "delete-payment-method",
    windowMs: 60 * 1000,
    limit: 10,
  }),
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
      return throwAPIError({
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
