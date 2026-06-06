import { eq } from "drizzle-orm";

import { db } from "@/db";
import { paymentMethod } from "@/db/schema";
import type { PaymentMethodActiveWebhookData } from "@/domains/billing/schemas/entities/payment-method-webhook-data";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

export async function processPaymentMethodActiveEvent(
  data: PaymentMethodActiveWebhookData,
) {
  const receivedPaymentMethodActive = data.object;

  // Выполняем все нужные проверки

  const foundPaymentMethod = await db.query.paymentMethod.findFirst({
    where: (paymentMethod, { eq }) =>
      eq(paymentMethod.externalId, receivedPaymentMethodActive.id),
  });

  if (!foundPaymentMethod) {
    return throwAPIError({
      code: APIErrorCode.NotFound,
      message: "Метод оплаты не найден",
    });
  }

  // Проставляем статус метода оплаты в "активный"

  await db
    .update(paymentMethod)
    .set({
      status: "active",
      type: receivedPaymentMethodActive.type,
      title: receivedPaymentMethodActive.title,
      data: receivedPaymentMethodActive,
    })
    .where(eq(paymentMethod.id, foundPaymentMethod.id));
}
