import { db } from "@/db";

type GetActivePaymentMethodParams = {
  userId: string;
  paymentMethodId: string;
};

export async function getActivePaymentMethod({
  userId,
  paymentMethodId,
}: GetActivePaymentMethodParams) {
  const foundPaymentMethod = await db.query.paymentMethod.findFirst({
    where: (paymentMethod, { and, eq }) =>
      and(
        eq(paymentMethod.id, paymentMethodId),
        eq(paymentMethod.userId, userId),
        eq(paymentMethod.status, "active"),
      ),
  });

  return foundPaymentMethod;
}
