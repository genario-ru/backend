import { eq } from "drizzle-orm";

import { db } from "@/db";
import { payment } from "@/db/schema";
import type { PaymentCanceledWebhookData } from "@/domains/billing/schemas/entities/payment-webhook-data";
import { processPaymentCancellationDetails } from "@/lib/yookassa/utils/process-payment-cancellation-details";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

import { registerSubscriptionBillingFailure } from "./register-subscription-billing-failure";
import { sendSubscriptionPaymentFailedEmail } from "./send-subscription-payment-failed-email";

export async function processPaymentCanceledEvent(
  data: PaymentCanceledWebhookData,
) {
  const receivedPayment = data.object;

  // Выполняем все нужные проверки

  const foundPayment = await db.query.payment.findFirst({
    where: (payment, { eq }) => eq(payment.externalId, receivedPayment.id),
    with: {
      subscriptionToPayment: {
        with: {
          subscription: {
            with: {
              tariff: true,
            },
          },
        },
      },
      user: true,
    },
  });

  if (!foundPayment) {
    return throwAPIError({
      code: APIErrorCode.NotFound,
      message: "Платеж не найден",
    });
  }

  // Обрабатываем только ожидающие оплаты платежи: это защищает от повторной
  // обработки вебхука и от отмены уже успешного / проваленного платежа.
  if (foundPayment.status !== "pending") {
    return;
  }

  // Проставляем статус платежа в "отменен" с указанием причины отмены и
  // обновляем связанную подписку в зависимости от типа платежа.
  const statusDetails = processPaymentCancellationDetails(
    receivedPayment.cancellation_details,
  );

  const paymentFailedEmailData = await db.transaction(async (tx) => {
    await tx
      .update(payment)
      .set({
        status: "canceled",
        statusDetails,
      })
      .where(eq(payment.id, foundPayment.id));

    const isRecurringPayment = !foundPayment.paymentLink;

    // Если платеж не рекуррентный, то ничего больше не делаем.
    if (!isRecurringPayment) {
      return null;
    }

    // Рекуррентное списание не прошло — регистрируем неудачную попытку оплаты.
    const linkedSubscription = foundPayment.subscriptionToPayment?.subscription;

    if (!linkedSubscription) {
      return null;
    }

    const billingFailure = await registerSubscriptionBillingFailure({
      userId: foundPayment.userId,
      subscriptionId: linkedSubscription.id,
      failedBillingAttempts: linkedSubscription.failedBillingAttempts,
      tx,
    });

    if (billingFailure.subscriptionTerminated) {
      return null;
    }

    return {
      tariffName: linkedSubscription.tariff.name,
      tariffPrice: linkedSubscription.tariff.price,
    };
  });

  if (paymentFailedEmailData) {
    await sendSubscriptionPaymentFailedEmail({
      userEmail: foundPayment.user.email,
      userId: foundPayment.userId,
      tariffName: paymentFailedEmailData.tariffName,
      tariffPrice: paymentFailedEmailData.tariffPrice,
    });
  }
}
