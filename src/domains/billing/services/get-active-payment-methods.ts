import { db } from "@/db";

type GetActivePaymentMethodsParams = {
  userId: string;
};

export async function getActivePaymentMethods({
  userId,
}: GetActivePaymentMethodsParams) {
  const foundPaymentMethods = await db.query.paymentMethod.findMany({
    orderBy: (paymentMethod, { desc }) => [
      desc(paymentMethod.default),
      desc(paymentMethod.createdAt),
    ],
    where: (paymentMethod, { and, eq }) =>
      and(eq(paymentMethod.userId, userId), eq(paymentMethod.status, "active")),
  });

  return foundPaymentMethods;
}
