import { addDays, addMonths, addYears } from "date-fns";
import { eq } from "drizzle-orm";

import type { Payment } from "@/codegen/api/yookassa";
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
import type { SubscriptionWithTariff } from "@/domains/subscriptions/schemas/entities/subscription";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

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
          nextSubscription: {
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

  // Обрабатываем только ожидающие оплаты платежи: это защищает от повторной
  // обработки вебхука и от активации уже отмененного / проваленного платежа.
  if (foundPayment.status !== "pending") {
    return;
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

  const foundPaymentNextSubscription =
    foundPayment.subscriptionToPayment?.nextSubscription;

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

    // Сохраняем метод оплаты, если пользователь дал на это согласие.
    // По умолчанию при создании платежа мы указываем, что привязка
    // обязательная, но на всякий случай все равно делаем проверку.
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

    // Если это оплата подписки, то активируем и продляем ее
    if (foundPaymentSubscription) {
      const {
        subscriptionCycleStartsAt,
        subscriptionCycleEndsAt,
        subscriptionNextBillingAt,
        subscriptionLastBilledAt,
        subscriptionStartsAt,
        subscriptionEndsAt,
        nextSubscriptionStartsAt,
        nextSubscriptionNextBillingAt,
      } = getSubscriptionsDates(
        receivedPayment,
        foundPaymentSubscription,
        foundPaymentNextSubscription,
      );

      await tx
        .update(subscription)
        .set({
          startsAt: subscriptionStartsAt,
          endsAt: subscriptionEndsAt,
          cycleStartsAt: subscriptionCycleStartsAt,
          cycleEndsAt: subscriptionCycleEndsAt,
          lastBilledAt: subscriptionLastBilledAt,
          nextBillingAt: subscriptionNextBillingAt,
          failedBillingAttempts: 0,
          status: "active",
        })
        .where(eq(subscription.id, foundPaymentSubscription.id));

      if (foundPaymentNextSubscription) {
        await tx
          .update(subscription)
          .set({
            startsAt: nextSubscriptionStartsAt,
            nextBillingAt: nextSubscriptionNextBillingAt,
            failedBillingAttempts: 0,
            status: "pending",
          })
          .where(eq(subscription.id, foundPaymentNextSubscription.id));
      }

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
            expiresAt: subscriptionCycleEndsAt,
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

function getSubscriptionsDates(
  payment: Payment,
  subscription: SubscriptionWithTariff,
  nextSubscription?: SubscriptionWithTariff | null,
) {
  let subscriptionCycleEndsAt: string | undefined;
  let subscriptionNextBillingAt: string | undefined;
  let subscriptionEndsAt: string | undefined;

  const subscriptionStartsAt =
    subscription.startsAt ?? new Date().toISOString();

  const subscriptionCycleStartsAt =
    subscription.cycleEndsAt ??
    subscription.startsAt ??
    new Date().toISOString();

  const subscriptionLastBilledAt =
    payment.captured_at ?? new Date().toISOString();

  // Если у тарифа подписки есть продолжительность в днях, то используем ее
  if (subscription.tariff.durationDays) {
    subscriptionCycleEndsAt = addDays(
      subscriptionCycleStartsAt,
      subscription.tariff.durationDays,
    ).toISOString();

    if (subscription.tariff.isRenewable) {
      subscriptionNextBillingAt = addDays(
        subscriptionLastBilledAt,
        subscription.tariff.durationDays,
      ).toISOString();
    }
  } else {
    // В ином случае используем период биллинга тарифа
    const subscriptionBillingPeriod = subscription.tariff.billingPeriod;

    subscriptionCycleEndsAt =
      subscriptionBillingPeriod === "year"
        ? addYears(subscriptionCycleStartsAt, 1).toISOString()
        : addMonths(subscriptionCycleStartsAt, 1).toISOString();

    if (subscription.tariff.isRenewable) {
      subscriptionNextBillingAt =
        subscriptionBillingPeriod === "year"
          ? addYears(subscriptionLastBilledAt, 1).toISOString()
          : addMonths(subscriptionLastBilledAt, 1).toISOString();
    }
  }

  // Если тариф не является возобновляемым, то дата окончания подписки совпадает с датой окончания ее текущего цикла
  if (!subscription.tariff.isRenewable) {
    subscriptionEndsAt = subscriptionCycleEndsAt;
  }

  // Если есть следующая подписка, то убираем даты следующего биллинга и ставим дату окончания подписки на дату окончания ее текущего цикла
  if (nextSubscription) {
    subscriptionEndsAt = subscriptionCycleEndsAt;
    subscriptionNextBillingAt = undefined;
  } else {
    // Если нет следующей подписки, то сразу возвращаем даты текущей подписки
    return {
      subscriptionCycleStartsAt,
      subscriptionCycleEndsAt,
      subscriptionNextBillingAt,
      subscriptionLastBilledAt,
      subscriptionStartsAt,
      subscriptionEndsAt,
    };
  }

  const nextSubscriptionStartsAt = subscriptionEndsAt;
  const nextSubscriptionNextBillingAt = nextSubscriptionStartsAt;

  return {
    subscriptionCycleStartsAt,
    subscriptionCycleEndsAt,
    subscriptionNextBillingAt,
    subscriptionLastBilledAt,
    subscriptionStartsAt,
    subscriptionEndsAt,
    nextSubscriptionStartsAt,
    nextSubscriptionNextBillingAt,
  };
}
