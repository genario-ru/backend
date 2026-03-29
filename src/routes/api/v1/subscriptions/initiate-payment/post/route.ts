import { randomUUID } from "crypto";
import { validator } from "hono-openapi";

import { postPayments } from "@/codegen/api/yookassa";
import { envs } from "@/constants/common/envs";
import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { initiateSubscriptionPaymentBodySchema } from "@/schemas/entities/subscriptions/handlers/initiate-subscriptions-payment/body";
import {
  type InitiateSubscriptionPaymentResponse,
  initiateSubscriptionPaymentResponseSchema,
} from "@/schemas/entities/subscriptions/handlers/initiate-subscriptions-payment/response";
import type { Tariff } from "@/schemas/entities/tariffs/entities/tariff";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";
import { throwAPIError } from "@/utils/server/throw-api-error";

export const initiateSubscriptionPaymentRoute = createHonoApp().basePath(
  "/subscriptions/initiate-payment",
);

// POST /api/v1/subscriptions/initiate-payment
initiateSubscriptionPaymentRoute.post(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "initiate-subscription-payment",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Subscriptions],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Subscription payment initiated successfully",
        schema: initiateSubscriptionPaymentResponseSchema,
      }),
    },
  }),
  validator("json", initiateSubscriptionPaymentBodySchema),
  async (c) => {
    const user = c.get("user");

    const {
      tariffSlug,
      trialTariffSlug,
      redirect: redirectPath,
    } = c.req.valid("json");

    const foundTariff = await db.query.tariff.findFirst({
      where: (tariff, { eq }) => eq(tariff.slug, tariffSlug),
    });

    if (!foundTariff) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Указанный тариф не существует",
      });
    }

    let foundTrialTariff: Tariff | undefined;

    if (trialTariffSlug) {
      foundTrialTariff = await db.query.tariff.findFirst({
        where: (tariff, { and, eq }) =>
          and(eq(tariff.slug, trialTariffSlug), eq(tariff.isRenewable, false)),
      });

      if (!foundTrialTariff) {
        return throwAPIError({
          code: APIErrorCode.NotFound,
          message: "Указанный тариф пробного периода не существует",
        });
      }
    }

    // Готовим данные для запроса к API ЮKassa

    const lastPendingPayment = await db.query.payment.findFirst({
      where: (payment, { and, eq }) =>
        and(
          eq(payment.status, "pending"),
          eq(payment.entity, "tariff"),
          eq(payment.entityId, foundTariff.id),
          eq(payment.userId, user.id),
        ),
      orderBy: (payment, { desc }) => desc(payment.createdAt),
    });

    const idempotenceKey = lastPendingPayment?.id ?? randomUUID();

    const returnUrl = redirectPath
      ? `${envs.FRONTEND_BASE_URL}${redirectPath}`
      : `${envs.FRONTEND_BASE_URL}/home`;

    const amount = {
      value: foundTrialTariff ? foundTrialTariff.price : foundTariff.price,
      currency: "RUB",
    };

    const description = foundTrialTariff
      ? `Оплата пробного периода "${foundTrialTariff.name}" для ${user.email}`
      : `Оплата тарифа "${foundTariff.name}" для ${user.email}`;

    const receiptItemDescription = foundTrialTariff
      ? `Пробный период "${foundTrialTariff.name}" в сервисе ${envs.FRONTEND_BASE_URL}`
      : `Тариф "${foundTariff.name}" в сервисе ${envs.FRONTEND_BASE_URL}`;

    // Отправляем запрос к API ЮKassa

    const payment = await postPayments({
      data: {
        amount,
        description,
        receipt: {
          customer: {
            email: user.email,
          },
          items: [
            {
              description: receiptItemDescription,
              amount,
              vat_code: 1,
              quantity: 1,
              measure: "piece",
              payment_subject: "service",
              payment_mode: "full_payment",
            },
          ],
        },
        confirmation: {
          type: "redirect",
          return_url: returnUrl,
        },
        save_payment_method: true,
        capture: true,
      },
      headers: {
        "Idempotence-Key": idempotenceKey,
      },
    });

    console.log("payment", payment);

    return c.json<InitiateSubscriptionPaymentResponse>(
      initiateSubscriptionPaymentResponseSchema.parse({
        data: {
          paymentLink: "",
        },
      }),
    );
  },
);
