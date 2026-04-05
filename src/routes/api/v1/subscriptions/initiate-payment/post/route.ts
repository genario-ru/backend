import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { postPayments } from "@/codegen/api/yookassa";
import { envs } from "@/constants/shared/common/envs";
import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import { OpenAPITags } from "@/constants/shared/openapi/tags";
import { db } from "@/db";
import { payment, subscription, subscriptionToPayment } from "@/db/schema";
import { initiateSubscriptionPaymentBodySchema } from "@/domains/subscriptions/schemas/handlers/initiate-subscriptions-payment/body";
import {
  type InitiateSubscriptionPaymentResponse,
  initiateSubscriptionPaymentResponseSchema,
} from "@/domains/subscriptions/schemas/handlers/initiate-subscriptions-payment/response";
import type { Tariff } from "@/domains/tariffs/schemas/entities/tariff";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/shared/common/api-error";
import { createOpenAPIResponse } from "@/utils/shared/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";
import { throwAPIError } from "@/utils/shared/server/throw-api-error";

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

    const computedTariffId = foundTrialTariff
      ? foundTrialTariff.id
      : foundTariff.id;

    const lastPendingPayments = await db.query.payment.findMany({
      where: (payment, { and, eq }) =>
        and(eq(payment.status, "pending"), eq(payment.userId, user.id)),
      orderBy: (payment, { desc }) => desc(payment.createdAt),
      with: {
        subscriptionToPayment: {
          with: {
            subscription: true,
          },
        },
      },
    });

    const lastPendingSubscriptionPayment = lastPendingPayments.find(
      (payment) => {
        const linkedSubscription = payment.subscriptionToPayment?.subscription;
        const isSameTariff = linkedSubscription?.tariffId === computedTariffId;
        const isPending = linkedSubscription?.status === "pending";

        return isSameTariff && isPending;
      },
    );

    const idempotenceKey = lastPendingSubscriptionPayment?.id ?? randomUUID();

    const returnUrl = redirectPath
      ? `${envs.FRONTEND_BASE_URL}${redirectPath}`
      : `${envs.FRONTEND_BASE_URL}/home`;

    const amountValue = foundTrialTariff
      ? foundTrialTariff.price
      : foundTariff.price;

    const description = foundTrialTariff
      ? `Оплата пробного периода "${foundTrialTariff.name}" для ${user.email}`
      : `Оплата тарифа "${foundTariff.name}" для ${user.email}`;

    const receiptItemDescription = foundTrialTariff
      ? `Пробный период "${foundTrialTariff.name}" в сервисе ${envs.FRONTEND_BASE_URL}`
      : `Тариф "${foundTariff.name}" в сервисе ${envs.FRONTEND_BASE_URL}`;

    // Отправляем запрос к API ЮKassa

    const createdYooKassaPayment = await postPayments({
      data: {
        amount: {
          value: amountValue.toString(),
          currency: "RUB",
        },
        description,
        receipt: {
          customer: {
            email: user.email,
          },
          items: [
            {
              description: receiptItemDescription,
              amount: {
                value: amountValue.toString(),
                currency: "RUB",
              },
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

    if (
      !createdYooKassaPayment.confirmation ||
      !("confirmation_url" in createdYooKassaPayment.confirmation)
    ) {
      return throwAPIError({
        code: APIErrorCode.InternalServerError,
        message: "Произошла ошибка при инициализации платежа для подписки",
      });
    }

    const createdYooKassaPaymentConfirmationUrl =
      createdYooKassaPayment.confirmation.confirmation_url;

    if (lastPendingSubscriptionPayment) {
      await db
        .update(payment)
        .set({
          paymentId: createdYooKassaPayment.id,
          paymentLink: createdYooKassaPaymentConfirmationUrl,
          amount: amountValue,
          currency: "RUB",
        })
        .where(eq(payment.id, lastPendingSubscriptionPayment.id));

      return c.json<InitiateSubscriptionPaymentResponse>(
        initiateSubscriptionPaymentResponseSchema.parse({
          data: {
            paymentLink: createdYooKassaPaymentConfirmationUrl,
          },
        }),
      );
    }

    await db.transaction(async (tx) => {
      const [[createdPayment], [createdSubscription]] = await Promise.all([
        tx
          .insert(payment)
          .values({
            id: idempotenceKey,
            userId: user.id,
            amount: amountValue,
            currency: "RUB",
            paymentId: createdYooKassaPayment.id,
            paymentLink: createdYooKassaPaymentConfirmationUrl,
            status: "pending",
          })
          .returning(),
        tx
          .insert(subscription)
          .values({
            userId: user.id,
            tariffId: foundTariff.id,
            status: "pending",
          })
          .returning(),
      ]);

      await tx.insert(subscriptionToPayment).values({
        subscriptionId: createdSubscription.id,
        paymentId: createdPayment.id,
      });
    });

    return c.json<InitiateSubscriptionPaymentResponse>(
      initiateSubscriptionPaymentResponseSchema.parse({
        data: {
          paymentLink: createdYooKassaPaymentConfirmationUrl,
        },
      }),
    );
  },
);
