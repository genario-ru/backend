import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { payment, subscription, subscriptionToPayment } from "@/db/schema";
import type { SubscriptionWithTariff } from "@/domains/subscriptions/schemas/entities/subscription";

import { prepareYooKassaRecurringPaymentParams } from "../utils/prepare-yookassa-recurring-payment-params";
import { createYooKassaRecurringPayment } from "./create-yookassa-recurring-payment";
import { getActivePaymentMethods } from "./get-active-payment-methods";
import { getLastPendingPayments } from "./get-last-pending-payments";
import { terminateSubscription } from "./terminate-subscription";

type InitiateSubscriptionRecurringPaymentParams = {
  userId: string;
  userEmail: string;
  subscription: SubscriptionWithTariff;
};

export async function initiateSubscriptionRecurringPayment({
  userId,
  userEmail,
  subscription: nextSubscription,
}: InitiateSubscriptionRecurringPaymentParams) {
  const foundPaymentMethods = await getActivePaymentMethods({
    userId,
  });

  if (!foundPaymentMethods.length) {
    // Если у пользователя нет активных способов оплаты, то:
    // 1. Проверяем количество failed попыток проведения платежа по текущей подписке.
    // 2. Если количество failed попыток проведения платежа больше 3, то обновляем статус подписки на terminated и переходим к следующему пользователю.
    // 3. Если количество failed попыток проведения платежа меньше 3, то отправляем пользователю Email, чтобы он добавил способ оплаты, увеличиваем количество failed попыток проведения платежа на 1 и переходим к следующему пользователю.

    const failedBillingAttempts = nextSubscription.failedBillingAttempts;

    if (failedBillingAttempts >= 3) {
      await terminateSubscription({
        userId,
        subscriptionId: nextSubscription.id,
      });

      return;
    }

    await db
      .update(subscription)
      .set({ failedBillingAttempts: failedBillingAttempts + 1 })
      .where(eq(subscription.id, nextSubscription.id));

    // TODO: Отправляем пользователю Email, чтобы он добавил способ оплаты и переходим к следующему пользователю.
    return;
  } else {
    const [foundPaymentMethod] = foundPaymentMethods;

    const lastPendingPayments = await getLastPendingPayments({
      userId,
    });

    // Пробуем найти ожидающий платеж для текущей подписки
    const lastPendingSubscriptionPayment = lastPendingPayments.find(
      (payment) =>
        payment.subscriptionToPayment?.subscription?.id === nextSubscription.id,
    );

    // Если нет ожидающих платежей по текущей подписке, то генерируем новый idempotenceKey
    const idempotenceKey = lastPendingSubscriptionPayment?.id ?? randomUUID();

    const { amountValue, description } = prepareYooKassaRecurringPaymentParams({
      tariff: nextSubscription.tariff,
      userEmail,
    });

    // Создаем / обновляем платеж в ЮKassa
    const createdYooKassaRecurringPayment =
      await createYooKassaRecurringPayment({
        amountValue,
        description,
        userEmail,
        receiptItemDescription: description,
        paymentMethodId: foundPaymentMethod.id,
        idempotenceKey,
      });

    // Если есть уже ожидающий оплату платеж, то:
    // 1. Обновляем платеж в БД.
    // 2. Переходим к следующему пользователю.
    if (lastPendingSubscriptionPayment) {
      await db
        .update(payment)
        .set({
          paymentId: createdYooKassaRecurringPayment.id,
          paymentMethodId: foundPaymentMethod.id,
          amount: amountValue,
          currency: "RUB",
          status: "pending",
        })
        .where(eq(payment.id, lastPendingSubscriptionPayment.id));

      return;
    }

    // Если нет ожидающих платежей, то:
    // 1. Создаем новый платеж и связываем его с текущей подпиской
    // 2. Не обновляем подписку, так как она уже существует и будет обновлена после успешного платежа через webhook.
    // 3. переходим к следующему пользователю.
    await db.transaction(async (tx) => {
      const [createdPayment] = await tx
        .insert(payment)
        .values({
          id: idempotenceKey,
          userId,
          amount: amountValue,
          paymentId: createdYooKassaRecurringPayment.id,
          paymentMethodId: foundPaymentMethod.id,
          currency: "RUB",
          status: "pending",
        })
        .returning();

      await tx.insert(subscriptionToPayment).values({
        subscriptionId: nextSubscription.id,
        paymentId: createdPayment.id,
      });
    });
  }
}
