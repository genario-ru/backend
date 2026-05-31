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
    return;
  }

  const tx = txParam ?? db;

  await tx
    .update(subscription)
    .set({
      failedBillingAttempts,
      status: "overdue",
      statusUpdatedAt: new Date().toISOString(),
    })
    .where(eq(subscription.id, subscriptionId));
}
