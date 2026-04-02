import { addMonths, addYears } from "date-fns";
import { eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import {
  creditsBatch,
  creditsPackageToCreditsBatch,
  payment,
  paymentMethod,
  subscription,
  subscriptionToCreditsBatch,
} from "@/db/schema";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import type { PaymentSucceededWebhookData } from "@/schemas/entities/billing/entities/payment-webhook-data";
import { processWebhookBodySchema } from "@/schemas/entities/billing/handlers/process-webhook/body";
import {
  type ProcessWebhookResponse,
  processWebhookResponseSchema,
} from "@/schemas/entities/billing/handlers/process-webhook/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";
import { throwAPIError } from "@/utils/server/throw-api-error";

export const processWebhookRoute = createHonoApp().basePath("/billing/webhook");

processWebhookRoute.post(
  "/",
  rateLimitMiddleware({
    keyPrefix: "process-webhook",
    windowMs: 60 * 1000,
    limit: 30,
  }),
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Billing],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Webhook processed successfully",
        schema: processWebhookResponseSchema,
      }),
    },
  }),
  validator("json", processWebhookBodySchema),
  async (c) => {
    const body = c.req.valid("json");

    switch (body.event) {
      case "payment.succeeded":
        return await handlePaymentSucceeded(body);

      case "payment.canceled":
        break;

      case "refund.succeeded":
        break;

      case "payment_method.active":
        break;
    }

    return c.json<ProcessWebhookResponse>(
      processWebhookResponseSchema.parse({
        success: true,
      }),
      HTTPStatusCode.Ok,
    );
  },
);

async function handlePaymentSucceeded(data: PaymentSucceededWebhookData) {
  const receivedPayment = data.object;

  // Выполняем все нужные проверки

  const foundPayment = await db.query.payment.findFirst({
    where: (payment, { eq }) => eq(payment.paymentId, receivedPayment.id),
    with: {
      subscriptionToPayment: {
        with: {
          subscription: {
            with: {
              tariff: {
                with: {
                  creditsPackage: true,
                },
              },
            },
          },
        },
      },
      tariffToPayment: {
        with: {
          tariff: {
            with: {
              creditsPackage: true,
            },
          },
        },
      },
      creditsPackageToPayment: {
        with: {
          creditsPackage: true,
        },
      },
    },
  });

  if (!foundPayment) {
    return throwAPIError({
      code: APIErrorCode.NotFound,
      message: "Платеж не найден",
    });
  }

  if (receivedPayment.status !== "succeeded") {
    const statusDetails = "Статус платежа отличается от ожидаемого";

    await db
      .update(payment)
      .set({
        status: "failed",
        statusDetails,
      })
      .where(eq(payment.id, foundPayment.id));

    console.error(statusDetails, {
      paymentId: foundPayment.id,
      receivedPaymentId: receivedPayment.id,
    });

    return throwAPIError({
      code: APIErrorCode.ValidationError,
      message: statusDetails,
    });
  }

  const foundPaymentUserId = foundPayment.userId;

  const foundPaymentSubscription =
    foundPayment.subscriptionToPayment?.subscription;

  const foundPaymentTariff = foundPayment.tariffToPayment?.tariff;

  const foundPaymentCreditsPackage =
    foundPayment.creditsPackageToPayment?.creditsPackage;

  if (
    !foundPaymentSubscription &&
    !foundPaymentTariff &&
    !foundPaymentCreditsPackage
  ) {
    const statusDetails = "Субъект оплаты не найден";

    await db
      .update(payment)
      .set({
        status: "failed",
        statusDetails,
      })
      .where(eq(payment.id, foundPayment.id));

    console.error(statusDetails, {
      paymentId: foundPayment.id,
      receivedPaymentId: receivedPayment.id,
    });

    return throwAPIError({
      code: APIErrorCode.NotFound,
      message: statusDetails,
    });
  }

  // Начинаем выполнение транзакции для сохранения всех необходимых данных
  await db.transaction(async (tx) => {
    let paymentMethodId: string | undefined;
    const receivedPaymentMethod = receivedPayment.payment_method;

    // Сохраняем метод оплаты, если пользователь дал на это согласие
    // P.S. По умолчанию при создании платежа мы указываем, что привязка
    // обязательная, но на всякий случай все равно делаем проверку
    if (receivedPaymentMethod && receivedPaymentMethod.saved) {
      const foundPaymentMethod = await tx.query.paymentMethod.findFirst({
        where: (paymentMethod, { and, eq }) =>
          and(
            eq(paymentMethod.userId, foundPaymentUserId),
            eq(paymentMethod.paymentMethodId, receivedPaymentMethod.id),
          ),
      });

      if (foundPaymentMethod) {
        paymentMethodId = foundPaymentMethod.id;
      } else {
        const {
          id: receivedPaymentMethodId,
          type: receivedPaymentMethodType,
          title: receivedPaymentMethodTitle,
          saved: _receivedPaymentMethodSaved,
          status: _receivedPaymentMethodStatus,
          ...receivedPaymentMethodData
        } = receivedPaymentMethod;

        const [createdPaymentMethod] = await tx
          .insert(paymentMethod)
          .values({
            status: "active",
            userId: foundPaymentUserId,
            paymentMethodId: receivedPaymentMethodId,
            type: receivedPaymentMethodType,
            title: receivedPaymentMethodTitle,
            data: receivedPaymentMethodData,
          })
          .returning();

        paymentMethodId = createdPaymentMethod.id;
      }
    }

    // Обновляем данные о платеже
    await tx
      .update(payment)
      .set({
        paymentId: receivedPayment.id,
        paymentMethodId,
        status: "succeeded",
      })
      .where(eq(payment.id, foundPayment.id))
      .returning();

    if (foundPaymentSubscription) {
      // Если это оплата подписки, то продляем ее

      const tariffBillingPeriod = foundPaymentSubscription.tariff.billingPeriod;
      const cycleStartsAt = foundPaymentSubscription.cycleEndsAt;

      const cycleEndsAt =
        tariffBillingPeriod === "year"
          ? addYears(cycleStartsAt, 1).toISOString()
          : addMonths(cycleStartsAt, 1).toISOString();

      const lastBilledAt =
        receivedPayment.captured_at ?? new Date().toISOString();

      const nextBillingAt =
        tariffBillingPeriod === "year"
          ? addYears(lastBilledAt, 1).toISOString()
          : addMonths(lastBilledAt, 1).toISOString();

      await tx
        .update(subscription)
        .set({
          cycleStartsAt,
          cycleEndsAt,
          lastBilledAt,
          nextBillingAt,
          failedBillingAttempts: 0,
          status: "active",
        })
        .where(eq(subscription.id, foundPaymentSubscription.id));

      // Если у тарифа подписки есть пакет кредитов, то добавляем его в баланс пользователя
      if (foundPaymentSubscription.tariff.creditsPackage) {
        const [createdCreditsBatch] = await tx
          .insert(creditsBatch)
          .values({
            userId: foundPaymentUserId,
            name: foundPaymentSubscription.tariff.creditsPackage.name,
            description:
              foundPaymentSubscription.tariff.creditsPackage.description,
            initialAmount:
              foundPaymentSubscription.tariff.creditsPackage.amount,
            remainingAmount:
              foundPaymentSubscription.tariff.creditsPackage.amount,
            expiresAt: cycleEndsAt,
          })
          .returning();

        await tx.insert(subscriptionToCreditsBatch).values({
          subscriptionId: foundPaymentSubscription.id,
          creditsBatchId: createdCreditsBatch.id,
        });
      }
    } else if (foundPaymentTariff) {
      // Если это оплата тарифа, то создаем подписку и добавляем кредиты в баланс пользователя

      const tariffBillingPeriod = foundPaymentTariff.billingPeriod;
      const cycleStartsAt = new Date().toISOString();

      const cycleEndsAt =
        tariffBillingPeriod === "year"
          ? addYears(cycleStartsAt, 1).toISOString()
          : addMonths(cycleStartsAt, 1).toISOString();

      const lastBilledAt =
        receivedPayment.captured_at ?? new Date().toISOString();

      const nextBillingAt =
        tariffBillingPeriod === "year"
          ? addYears(lastBilledAt, 1).toISOString()
          : addMonths(lastBilledAt, 1).toISOString();

      const [createdSubscription] = await tx
        .insert(subscription)
        .values({
          userId: foundPaymentUserId,
          tariffId: foundPaymentTariff.id,
          startsAt: cycleStartsAt,
          cycleStartsAt,
          cycleEndsAt,
          lastBilledAt,
          nextBillingAt,
        })
        .returning();

      // Если у тарифа есть пакет кредитов, то добавляем его в баланс пользователя
      if (foundPaymentTariff.creditsPackage) {
        const [createdCreditsBatch] = await tx
          .insert(creditsBatch)
          .values({
            userId: foundPaymentUserId,
            name: foundPaymentTariff.creditsPackage.name,
            description: foundPaymentTariff.creditsPackage.description,
            initialAmount: foundPaymentTariff.creditsPackage.amount,
            remainingAmount: foundPaymentTariff.creditsPackage.amount,
            expiresAt: cycleEndsAt,
          })
          .returning();

        await tx.insert(subscriptionToCreditsBatch).values({
          subscriptionId: createdSubscription.id,
          creditsBatchId: createdCreditsBatch.id,
        });
      }
    } else if (foundPaymentCreditsPackage) {
      // Если это оплата пакета кредитов, то просто добавляем их в баланс пользователя

      const [createdCreditsBatch] = await tx
        .insert(creditsBatch)
        .values({
          userId: foundPaymentUserId,
          name: foundPaymentCreditsPackage.name,
          description: foundPaymentCreditsPackage.description,
          initialAmount: foundPaymentCreditsPackage.amount,
          remainingAmount: foundPaymentCreditsPackage.amount,
        })
        .returning();

      await tx.insert(creditsPackageToCreditsBatch).values({
        creditsPackageId: foundPaymentCreditsPackage.id,
        creditsBatchId: createdCreditsBatch.id,
      });
    }
  });
}
