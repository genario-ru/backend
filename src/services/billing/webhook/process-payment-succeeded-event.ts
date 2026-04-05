import { addMonths, addYears } from "date-fns";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  creditsBatch,
  creditsBatchToPayment,
  payment,
  paymentMethod,
  subscription,
  subscriptionToCreditsBatch,
} from "@/db/schema";
import type { PaymentSucceededWebhookData } from "@/domains/billing/schemas/entities/payment-webhook-data";
import { APIErrorCode } from "@/schemas/shared/common/api-error";
import { throwAPIError } from "@/utils/shared/server/throw-api-error";

export async function processPaymentSucceededEvent(
  data: PaymentSucceededWebhookData,
) {
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

    return throwAPIError({
      code: APIErrorCode.ValidationError,
      message: statusDetails,
    });
  }

  const foundPaymentUserId = foundPayment.userId;

  const foundPaymentSubscription =
    foundPayment.subscriptionToPayment?.subscription;

  const foundPaymentCreditsBatch =
    foundPayment.creditsBatchToPayment?.creditsBatch;

  if (!foundPaymentSubscription && !foundPaymentCreditsBatch) {
    const statusDetails = "Субъект оплаты не найден";

    await db
      .update(payment)
      .set({
        status: "failed",
        statusDetails,
      })
      .where(eq(payment.id, foundPayment.id));

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
        paymentMethodId,
        status: "succeeded",
      })
      .where(eq(payment.id, foundPayment.id))
      .returning();

    if (foundPaymentSubscription) {
      // Если это оплата подписки, то активируем и продляем ее

      const tariffBillingPeriod = foundPaymentSubscription.tariff.billingPeriod;

      const cycleStartsAt =
        foundPaymentSubscription.cycleEndsAt ?? new Date().toISOString();

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
            creditsPackageId: foundPaymentSubscription.tariff.creditsPackage.id,
            name: foundPaymentSubscription.tariff.creditsPackage.name,
            description:
              foundPaymentSubscription.tariff.creditsPackage.description,
            remainingAmount:
              foundPaymentSubscription.tariff.creditsPackage.amount,
            expiresAt: cycleEndsAt,
            status: "active",
          })
          .returning();

        await Promise.all([
          tx.insert(subscriptionToCreditsBatch).values({
            subscriptionId: foundPaymentSubscription.id,
            creditsBatchId: createdCreditsBatch.id,
          }),
          tx.insert(creditsBatchToPayment).values({
            creditsBatchId: createdCreditsBatch.id,
            paymentId: foundPayment.id,
          }),
        ]);
      }
    } else if (foundPaymentCreditsBatch) {
      // Если это оплата пакета кредитов, то просто активируем его

      await tx
        .update(creditsBatch)
        .set({ status: "active" })
        .where(eq(creditsBatch.id, foundPaymentCreditsBatch.id));
    }
  });
}
