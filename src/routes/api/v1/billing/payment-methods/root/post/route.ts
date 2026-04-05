import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { postPaymentMethods } from "@/codegen/api/yookassa";
import { envs } from "@/constants/shared/common/envs";
import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import { OpenAPITags } from "@/constants/shared/openapi/tags";
import { db } from "@/db";
import { paymentMethod } from "@/db/schema";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { addPaymentMethodBodySchema } from "@/schemas/domains/billing/handlers/add-payment-method/body";
import {
  type AddPaymentMethodResponse,
  addPaymentMethodResponseSchema,
} from "@/schemas/domains/billing/handlers/add-payment-method/response";
import { APIErrorCode } from "@/schemas/shared/common/api-error";
import { createOpenAPIResponse } from "@/utils/shared/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";
import { throwAPIError } from "@/utils/shared/server/throw-api-error";

import { prepareYooKassaPaymentMethodData } from "./utils";

export const addPaymentMethodRoute = createHonoApp().basePath(
  "/billing/payment-methods",
);

// POST /api/v1/billing/payment-methods
addPaymentMethodRoute.post(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "add-payment-method",
    windowMs: 60 * 1000,
    limit: 10,
  }),
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
      ? `${envs.FRONTEND_BASE_URL}${redirectPath}`
      : `${envs.FRONTEND_BASE_URL}/blling`;

    const createdYooKassaPaymentMethod = await postPaymentMethods({
      headers: {
        "Idempotence-Key": idempotenceKey,
      },
      data: {
        type: "bank_card",
        confirmation: {
          type: "redirect",
          return_url: returnUrl,
        },
      },
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
          paymentMethodId: createdYooKassaPaymentMethod.id,
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
        paymentMethodId: createdYooKassaPaymentMethod.id,
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
