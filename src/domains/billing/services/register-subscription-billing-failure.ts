import { addDays } from "date-fns";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { subscription } from "@/db/schema";
import type { Transaction } from "@/db/types";

import { terminateSubscription } from "./terminate-subscription";

// Максимальное количество неудачных попыток оплаты, после которого подписка
// переводится в статус terminated и доступ к сервису прекращается.
export const MAX_FAILED_BILLING_ATTEMPTS = 3;

type RegisterSubscriptionBillingFailureParams = {
  userId: string;
  subscriptionId: string;
  failedBillingAttempts: number;
  tx?: Transaction;
};

// Единая точка обработки неудачного списания по подписке: увеличиваем счетчик
// попыток, переводим подписку в overdue, а по достижении лимита — в terminated.
// Используется и при отсутствии способа оплаты, и при отмене рекуррентного платежа.
export async function registerSubscriptionBillingFailure({
  userId,
  subscriptionId,
  failedBillingAttempts: currentFailedBillingAttempts,
  tx: txParam,
}: RegisterSubscriptionBillingFailureParams) {
  const failedBillingAttempts = currentFailedBillingAttempts + 1;

  if (failedBillingAttempts >= MAX_FAILED_BILLING_ATTEMPTS) {
    await terminateSubscription({ userId, subscriptionId, tx: txParam });

    return {
      failedBillingAttempts,
      subscriptionTerminated: true,
    };
  }

  const tx = txParam ?? db;
  const currentDate = new Date();

  // Сдвигаем дату следующего списания на сутки вперед, чтобы крон (он работает
  // ежечасно) не пытался списать снова в течение того же часа и не исчерпал
  // лимит попыток за несколько часов. Так между ретраями проходит ~1 день.
  await tx
    .update(subscription)
    .set({
      failedBillingAttempts,
      status: "overdue",
      statusUpdatedAt: currentDate.toISOString(),
      nextBillingAt: addDays(currentDate, 1).toISOString(),
    })
    .where(eq(subscription.id, subscriptionId));

  return {
    failedBillingAttempts,
    subscriptionTerminated: false,
  };
}
