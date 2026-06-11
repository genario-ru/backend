import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { db } from "@/db";
import { paymentMethod } from "@/db/schema";
import { addPaymentMethodBodySchema } from "@/domains/billing/schemas/handlers/add-payment-method/body";
import {
  type AddPaymentMethodResponse,
  addPaymentMethodResponseSchema,
} from "@/domains/billing/schemas/handlers/add-payment-method/response";
import { createYooKassaPaymentMethod } from "@/domains/billing/services/create-yookassa-payment-method";
import { env } from "@/env";
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

import { prepareYooKassaPaymentMethodData } from "./utils";

export const addPaymentMethodRoute = createHonoApp().basePath(
  "/billing/payment-methods",
);

// POST /api/v1/billing/payment-methods
addPaymentMethodRoute.post(
  "/",
  rateLimitMiddleware({
    keyPrefix: "add-payment-method-burst",
    windowMs: 5 * 1000,
    limit: 1,
  }),
  rateLimitMiddleware({
    keyPrefix: "add-payment-method",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Billing],
    responses: {
      [HTTPStatusCode.Created]: createOpenAPIResponse({
        description: "Payment method adding process started",
        schema: addPaymentMethodResponseSchema,
      }),
    },
  }),
  validator("json", addPaymentMethodBodySchema),
  async (c) => {
    const user = c.get("user");
    const { redirectPath } = c.req.valid("json");

    const lastPendingPaymentMethod = await db.query.paymentMethod.findFirst({
      where: (paymentMethod, { and, eq }) =>
        and(
          eq(paymentMethod.status, "pending"),
          eq(paymentMethod.userId, user.id),
        ),
      orderBy: (paymentMethod, { desc }) => desc(paymentMethod.createdAt),
    });

    const idempotenceKey = lastPendingPaymentMethod?.id ?? randomUUID();

    const returnUrl = redirectPath
      ? `${env.FRONTEND_BASE_URL}${redirectPath}`
      : `${env.FRONTEND_BASE_URL}/billing`;

    const createdYooKassaPaymentMethod = await createYooKassaPaymentMethod({
      returnUrl,
      idempotenceKey,
    });

    if (!createdYooKassaPaymentMethod.confirmation?.confirmation_url) {
      return throwAPIError({
        code: APIErrorCode.InternalServerError,
        message: "Произошла ошибка при создании платежного метода",
      });
    }

    const confirmationUrl =
      createdYooKassaPaymentMethod.confirmation.confirmation_url;

    const paymentData = prepareYooKassaPaymentMethodData(
      createdYooKassaPaymentMethod,
    );

    if (lastPendingPaymentMethod) {
      await db
        .update(paymentMethod)
        .set({
          externalId: createdYooKassaPaymentMethod.id,
          type: createdYooKassaPaymentMethod.type,
          title: createdYooKassaPaymentMethod.title,
          confirmationUrl,
          data: paymentData,
        })
        .where(eq(paymentMethod.id, lastPendingPaymentMethod.id));

      return c.json<AddPaymentMethodResponse>(
        addPaymentMethodResponseSchema.parse({
          data: {
            confirmationUrl,
          },
        }),
      );
    }

    await db
      .insert(paymentMethod)
      .values({
        id: idempotenceKey,
        userId: user.id,
        externalId: createdYooKassaPaymentMethod.id,
        status: "pending",
        type: createdYooKassaPaymentMethod.type,
        title: createdYooKassaPaymentMethod.title,
        confirmationUrl,
        data: paymentData,
      })
      .returning();

    return c.json<AddPaymentMethodResponse>(
      addPaymentMethodResponseSchema.parse({
        data: {
          confirmationUrl,
        },
      }),
      HTTPStatusCode.Created,
    );
  },
);
