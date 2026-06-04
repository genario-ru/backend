import { randomUUID } from "crypto";
import { inArray } from "drizzle-orm";

import { db } from "@/db";
import { payment, subscriptionToPayment } from "@/db/schema";
import type { SubscriptionWithTariff } from "@/domains/subscriptions/schemas/entities/subscription";

import { prepareYooKassaRecurringPaymentParams } from "../utils/prepare-yookassa-recurring-payment-params";
import { createYooKassaRecurringPayment } from "./create-yookassa-recurring-payment";
import { getActivePaymentMethods } from "./get-active-payment-methods";
import { getLastPendingPayments } from "./get-last-pending-payments";
import { registerSubscriptionBillingFailure } from "./register-subscription-billing-failure";

type InitiateSubscriptionRecurringPaymentParams = {
  userId: string;
  userEmail: string;
  subscription: SubscriptionWithTariff;
};

export async function initiateSubscriptionRecurringPayment({
  userId,
  userEmail,
  subscription: subscriptionToCharge,
}: InitiateSubscriptionRecurringPaymentParams) {
  const foundPaymentMethods = await getActivePaymentMethods({ userId });

  if (!foundPaymentMethods.length) {
    // Если у пользователя нет активных способов оплаты, то:
    // 1. Проверяем количество failed попыток проведения платежа по текущей подписке.
    // 2. Если количество failed попыток проведения платежа больше 3, то обновляем статус подписки на terminated и переходим к следующему пользователю.
    // 3. Если количество failed попыток проведения платежа меньше 3, то отправляем пользователю Email, чтобы он добавил способ оплаты, увеличиваем количество failed попыток проведения платежа на 1 и переходим к следующему пользователю.

    await registerSubscriptionBillingFailure({
      userId,
      subscriptionId: subscriptionToCharge.id,
      failedBillingAttempts: subscriptionToCharge.failedBillingAttempts,
    });

    // TODO: Отправляем пользователю Email, чтобы он добавил способ оплаты и переходим к следующему пользователю.
    return;
  } else {
    const [foundPaymentMethod] = foundPaymentMethods;

    // Ожидающие платежи отменяем, но не удаляем, чтобы состав платежей
    // полностью соответствовал платежам в платежном провайдере.

    const lastPendingPayments = await getLastPendingPayments({
      userId,
      subscriptionIds: [subscriptionToCharge.id],
    });

    if (lastPendingPayments.length) {
      await db
        .update(payment)
        .set({
          status: "canceled",
          statusDetails:
            "Платеж отменен в связи с проведением рекуррентного платежа",
        })
        .where(
          inArray(
            payment.id,
            lastPendingPayments.map((payment) => payment.id),
          ),
        );
    }

    const idempotenceKey = randomUUID();

    const { amountValue, description } = prepareYooKassaRecurringPaymentParams({
      tariff: subscriptionToCharge.tariff,
      userEmail,
    });

    // Создаем / обновляем платеж в ЮKassa
    const createdYooKassaRecurringPayment =
      await createYooKassaRecurringPayment({
        amountValue,
        description,
        userEmail,
        receiptItemDescription: description,
        paymentMethodId: foundPaymentMethod.paymentMethodId,
        idempotenceKey,
      });

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
        subscriptionId: subscriptionToCharge.id,
        paymentId: createdPayment.id,
      });
    });
  }
}
