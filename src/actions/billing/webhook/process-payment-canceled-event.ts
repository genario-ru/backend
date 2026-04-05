import { eq } from "drizzle-orm";

import { db } from "@/db";
import { payment } from "@/db/schema";
import { processPaymentCancellationDetails } from "@/lib/yookassa/utils/process-payment-cancellation-details";
import type { PaymentCanceledWebhookData } from "@/schemas/entities/billing/entities/payment-webhook-data";
import { APIErrorCode } from "@/schemas/shared/common/api-error";
import { throwAPIError } from "@/utils/shared/server/throw-api-error";

export async function processPaymentCanceledEvent(
  data: PaymentCanceledWebhookData,
) {
  const receivedPayment = data.object;

  // Выполняем все нужные проверки

  const foundPayment = await db.query.payment.findFirst({
    where: (payment, { eq }) => eq(payment.paymentId, receivedPayment.id),
  });

  if (!foundPayment) {
    return throwAPIError({
      code: APIErrorCode.NotFound,
      message: "Платеж не найден",
    });
  }

  if (receivedPayment.status !== "canceled") {
    const statusDetails = "Статус платежа отличается от ожидаемого";

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

  // Проставляем статус платежа в "отменен" с указанием причины отмены

  const statusDetails = processPaymentCancellationDetails(
    receivedPayment.cancellation_details,
  );

  await db
    .update(payment)
    .set({
      status: "canceled",
      statusDetails,
    })
    .where(eq(payment.id, foundPayment.id));
}
