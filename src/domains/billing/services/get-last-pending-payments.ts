import { db } from "@/db";

type GetLastPendingPaymentsParams = {
  userId: string;
  subscriptionIds?: string[];
  nextSubscriptionIds?: string[];
};

export async function getLastPendingPayments({
  userId,
  subscriptionIds,
  nextSubscriptionIds,
}: GetLastPendingPaymentsParams) {
  const allLastPendingPayments = await db.query.payment.findMany({
    orderBy: (payment, { desc }) => desc(payment.createdAt),
    where: (payment, { and, eq }) =>
      and(eq(payment.status, "pending"), eq(payment.userId, userId)),
    with: {
      subscriptionToPayment: {
        with: {
          subscription: true,
          nextSubscription: true,
        },
      },
    },
  });

  if (subscriptionIds) {
    return allLastPendingPayments.filter(
      (payment) =>
        payment.subscriptionToPayment?.subscription?.id &&
        subscriptionIds.includes(
          payment.subscriptionToPayment?.subscription?.id,
        ),
    );
  }

  if (nextSubscriptionIds) {
    return allLastPendingPayments.filter(
      (payment) =>
        payment.subscriptionToPayment?.nextSubscription?.id &&
        nextSubscriptionIds.includes(
          payment.subscriptionToPayment?.nextSubscription?.id,
        ),
    );
  }

  return allLastPendingPayments;
}
