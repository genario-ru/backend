import { eq } from "drizzle-orm";

import { db } from "@/db";
import { creditsBatch, refund, subscription } from "@/db/schema";
import type { RefundSucceededWebhookData } from "@/schemas/domains/billing/entities/refund-webhook-data";
import { APIErrorCode } from "@/schemas/shared/common/api-error";
import { throwAPIError } from "@/utils/shared/server/throw-api-error";

export async function processRefundSucceededEvent(
  data: RefundSucceededWebhookData,
) {
  const receivedRefund = data.object;

  // Выполняем все нужные проверки

  const foundRefund = await db.query.refund.findFirst({
    where: (refund, { eq }) => eq(refund.externalId, receivedRefund.id),
    with: {
      payment: {
        with: {
          subscriptionToPayment: {
            with: {
              subscription: true,
            },
          },
          creditsBatchToPayment: {
            with: {
              creditsBatch: true,
            },
          },
        },
      },
    },
  });

  if (!foundRefund) {
    return throwAPIError({
      code: APIErrorCode.NotFound,
      message: "Возврат не найден",
    });
  }

  if (receivedRefund.status !== "succeeded") {
    const statusDetails = "Статус возврата отличается от ожидаемого";

    await db
      .update(refund)
      .set({
        status: "failed",
        statusDetails,
      })
      .where(eq(refund.id, foundRefund.id));

    return throwAPIError({
      code: APIErrorCode.NotFound,
      message: statusDetails,
    });
  }

  const foundLinkedSubscription =
    foundRefund.payment.subscriptionToPayment?.subscription;

  const foundLinkedCreditsBatch =
    foundRefund.payment.creditsBatchToPayment?.creditsBatch;

  if (!foundLinkedSubscription && !foundLinkedCreditsBatch) {
    const statusDetails = "Связанный субъект возврата не найден";

    await db
      .update(refund)
      .set({ status: "failed", statusDetails })
      .where(eq(refund.id, foundRefund.id));

    return throwAPIError({
      code: APIErrorCode.NotFound,
      message: statusDetails,
    });
  }

  // Проставляем статус возврата в "успешно" и отменяем подписку и/или удаляем кредиты из баланса пользователя

  await db.transaction(async (tx) => {
    await tx
      .update(refund)
      .set({ status: "succeeded" })
      .where(eq(refund.id, foundRefund.id));

    // Если возврат связан с подпиской, то отменяем ее
    if (foundLinkedSubscription) {
      await tx
        .update(subscription)
        .set({ status: "terminated" })
        .where(eq(subscription.id, foundLinkedSubscription.id));
    }

    // Если возврат связан с пакетом кредитов, то отменяем его
    // Не делаем else if, потому что платеж может быть связан с подпиской и пакетом кредитов одновременно
    if (foundLinkedCreditsBatch) {
      await tx
        .update(creditsBatch)
        .set({ status: "terminated" })
        .where(eq(creditsBatch.id, foundLinkedCreditsBatch.id));
    }
  });
}
