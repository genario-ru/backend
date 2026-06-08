import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { payment, subscription } from "@/db/schema";
import type { Transaction } from "@/db/types";

import { getLastPendingPayments } from "./get-last-pending-payments";

type CancelPendingSubscriptionsParams = {
  userId: string;
  tx?: Transaction;
};

// Удаляет все ожидающие подписки пользователя и отменяет их ожидающие платежи.
// Это могут быть подписки по тарифу, который пользователь выбрал следующим, или
// просто ожидающие оплаты подписки, по которым не был проведен платеж. Платежи
// не удаляем, а отменяем, чтобы состав платежей полностью соответствовал
// платежам в платежном провайдере.

export async function cancelPendingSubscriptions({
  userId,
  tx: txParam,
}: CancelPendingSubscriptionsParams): Promise<void> {
  const tx = txParam ?? db;

  const pendingSubscriptions = await db.query.subscription.findMany({
    where: (subscription, { and, eq }) =>
      and(eq(subscription.userId, userId), eq(subscription.status, "pending")),
  });

  if (!pendingSubscriptions.length) {
    return;
  }

  const pendingSubscriptionIds = pendingSubscriptions.map(
    (subscription) => subscription.id,
  );

  await tx.transaction(async (tx) => {
    await tx
      .delete(subscription)
      .where(
        and(
          inArray(subscription.id, pendingSubscriptionIds),
          eq(subscription.userId, userId),
        ),
      );

    const pendingSubscriptionPayments = await getLastPendingPayments({
      userId,
      subscriptionIds: pendingSubscriptionIds,
    });

    if (pendingSubscriptionPayments.length) {
      await tx
        .update(payment)
        .set({
          status: "canceled",
          statusDetails: "Платеж отменен в связи с созданием новой подписки",
        })
        .where(
          inArray(
            payment.id,
            pendingSubscriptionPayments.map((payment) => payment.id),
          ),
        );
    }
  });
}
