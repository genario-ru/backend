import { eq } from "drizzle-orm";

import { db } from "@/db";
import { creditsBatch, refund, subscription } from "@/db/schema";
import type { RefundSucceededWebhookData } from "@/domains/billing/schemas/entities/refund-webhook-data";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

export async function processRefundSucceededEvent(
  data: RefundSucceededWebhookData,
) {
  const receivedRefund = data.object;

  // Возвраты создаются вручную в личном кабинете ЮKassa, поэтому записи о них в
  // нашей БД может еще не быть — она создается прямо здесь, по факту вебхука.

  // Проверяем, не обработали ли мы уже этот возврат (защита от повторного
  // вебхука): если запись есть и она успешна, ничего не делаем.
  const existingRefund = await db.query.refund.findFirst({
    where: (refund, { eq }) => eq(refund.externalId, receivedRefund.id),
  });

  if (existingRefund && existingRefund.status === "succeeded") {
    return;
  }

  // Находим платеж, к которому относится возврат, и связанные с ним субъекты
  // (подписку и/или пакет кредитов).
  const foundPayment = await db.query.payment.findFirst({
    where: (payment, { eq }) =>
      eq(payment.externalId, receivedRefund.payment_id),
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
  });

  if (!foundPayment) {
    throw throwAPIError({
      code: APIErrorCode.NotFound,
      message: "Платеж для возврата не найден",
    });
  }

  const foundLinkedSubscription =
    foundPayment.subscriptionToPayment?.subscription;

  const foundLinkedCreditsBatch =
    foundPayment.creditsBatchToPayment?.creditsBatch;

  if (!foundLinkedSubscription && !foundLinkedCreditsBatch) {
    throw throwAPIError({
      code: APIErrorCode.NotFound,
      message: "Связанный субъект возврата не найден",
    });
  }

  // Сохраняем возврат и отзываем доступ: терминируем подписку и/или пакет
  // кредитов. Не делаем else if, потому что платеж может быть связан и с
  // подпиской, и с пакетом кредитов одновременно.
  await db.transaction(async (tx) => {
    if (existingRefund) {
      await tx
        .update(refund)
        .set({ status: "succeeded", statusDetails: null })
        .where(eq(refund.id, existingRefund.id));
    } else {
      await tx.insert(refund).values({
        externalId: receivedRefund.id,
        paymentId: foundPayment.id,
        status: "succeeded",
      });
    }

    if (foundLinkedSubscription) {
      await tx
        .update(subscription)
        .set({
          status: "terminated",
          statusUpdatedAt: new Date().toISOString(),
        })
        .where(eq(subscription.id, foundLinkedSubscription.id));
    }

    if (foundLinkedCreditsBatch) {
      await tx
        .update(creditsBatch)
        .set({ status: "terminated" })
        .where(eq(creditsBatch.id, foundLinkedCreditsBatch.id));
    }
  });
}
