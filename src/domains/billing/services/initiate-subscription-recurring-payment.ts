import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { payment, subscriptionToPayment } from "@/db/schema";
import type { SubscriptionWithTariff } from "@/domains/subscriptions/schemas/entities/subscription";

import { prepareYooKassaRecurringPaymentParams } from "../utils/prepare-yookassa-recurring-payment-params";
import { createYooKassaRecurringPayment } from "./create-yookassa-recurring-payment";
import { getActivePaymentMethods } from "./get-active-payment-methods";
import { getReusableSubscriptionPendingPayment } from "./get-reusable-subscription-pending-payment";
import { registerSubscriptionBillingFailure } from "./register-subscription-billing-failure";
import { sendSubscriptionPaymentFailedEmail } from "./send-subscription-payment-failed-email";

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

    const { subscriptionTerminated } = await registerSubscriptionBillingFailure(
      {
        userId,
        subscriptionId: subscriptionToCharge.id,
        failedBillingAttempts: subscriptionToCharge.failedBillingAttempts,
      },
    );

    if (!subscriptionTerminated) {
      await sendSubscriptionPaymentFailedEmail({
        userEmail,
        userId,
        tariffName: subscriptionToCharge.tariff.name,
        tariffPrice: subscriptionToCharge.tariff.price,
      });
    }
  } else {
    const [foundPaymentMethod] = foundPaymentMethods;

    // Ищем существующий рекуррентный pending-платеж по этой подписке. Если он
    // есть, переиспользуем его id как ключ идемпотентности: ЮKassa по тому же
    // ключу вернет тот же платеж, а не спишет деньги повторно. Так мы избегаем
    // двойного списания, когда крон запускается снова до прихода вебхука по
    // предыдущей попытке.
    const reusablePendingPayment = await getReusableSubscriptionPendingPayment({
      userId,
      subscriptionId: subscriptionToCharge.id,
    });

    const idempotenceKey = reusablePendingPayment?.id ?? randomUUID();

    const { amountValue, description } = prepareYooKassaRecurringPaymentParams({
      tariff: subscriptionToCharge.tariff,
      userEmail,
    });

    // Создаем / получаем платеж в ЮKassa (по тому же ключу идемпотентности
    // вернется ранее созданный платеж).
    const createdYooKassaRecurringPayment =
      await createYooKassaRecurringPayment({
        amountValue,
        description,
        userEmail,
        receiptItemDescription: description,
        paymentMethodId: foundPaymentMethod.externalId,
        idempotenceKey,
      });

    // Не обновляем подписку: она уже существует и будет обновлена после
    // успешного платежа через webhook.
    if (reusablePendingPayment) {
      // Обновляем существующий платеж актуальными данными от ЮKassa.
      await db
        .update(payment)
        .set({
          externalId: createdYooKassaRecurringPayment.id,
          paymentMethodId: foundPaymentMethod.id,
          amount: amountValue,
          currency: "RUB",
        })
        .where(eq(payment.id, reusablePendingPayment.id));

      return;
    }

    // Создаем новый платеж и связываем его с текущей подпиской.
    await db.transaction(async (tx) => {
      const [createdPayment] = await tx
        .insert(payment)
        .values({
          id: idempotenceKey,
          userId,
          amount: amountValue,
          externalId: createdYooKassaRecurringPayment.id,
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
