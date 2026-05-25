import { db } from "@/db";

type GetLastPendingPaymentsParams = {
  userId: string;
};

export async function getLastPendingPayments({
  userId,
}: GetLastPendingPaymentsParams) {
  const lastPendingPayments = await db.query.payment.findMany({
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

  return lastPendingPayments;
}
