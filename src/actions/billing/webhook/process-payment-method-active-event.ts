import { eq } from "drizzle-orm";

import { db } from "@/db";
import { paymentMethod } from "@/db/schema";
import type { PaymentMethodActiveWebhookData } from "@/schemas/entities/billing/entities/payment-method-webhook-data";
import { APIErrorCode } from "@/schemas/shared/common/api-error";
import { throwAPIError } from "@/utils/shared/server/throw-api-error";

export async function processPaymentMethodActiveEvent(
  data: PaymentMethodActiveWebhookData,
) {
  const receivedPaymentMethodActive = data.object;

  // Выполняем все нужные проверки

  const foundPaymentMethod = await db.query.paymentMethod.findFirst({
    where: (paymentMethod, { eq }) =>
      eq(paymentMethod.paymentMethodId, receivedPaymentMethodActive.id),
  });

  if (!foundPaymentMethod) {
    return throwAPIError({
      code: APIErrorCode.NotFound,
      message: "Метод оплаты не найден",
    });
  }

  if (receivedPaymentMethodActive.status !== "active") {
    const statusDetails = "Статус метода оплаты отличается от ожидаемого";

    await db
      .update(paymentMethod)
      .set({
        status: "inactive",
        statusDetails,
      })
      .where(eq(paymentMethod.id, foundPaymentMethod.id));

    return throwAPIError({
      code: APIErrorCode.NotFound,
      message: statusDetails,
    });
  }

  // Проставляем статус метода оплаты в "активный"

  await db
    .update(paymentMethod)
    .set({ status: "active" })
    .where(eq(paymentMethod.id, foundPaymentMethod.id));
}
