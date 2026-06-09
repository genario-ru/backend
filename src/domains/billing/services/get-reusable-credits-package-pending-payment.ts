import { db } from "@/db";

type GetReusableCreditsPackagePendingPaymentParams = {
  userId: string;
  creditsPackageId: string;
};

// Возвращает последний pending-платеж пользователя по тому же пакету кредитов
// с еще не активированным creditsBatch. Такой платеж переиспользуется при
// повторной инициации покупки: обновляется существующая строка payment вместо
// создания дубликатов payment/creditsBatch.
//
// В отличие от getReusableSubscriptionPendingPayment здесь нет фильтра по
// paymentLink: строка переиспользуется и redirect-, и рекуррентным флоу.
// Совместимость ключа идемпотентности ЮKassa проверяет вызывающий сервис по
// paymentLink найденного платежа.
export async function getReusableCreditsPackagePendingPayment({
  userId,
  creditsPackageId,
}: GetReusableCreditsPackagePendingPaymentParams) {
  const pendingPayments = await db.query.payment.findMany({
    orderBy: (payment, { desc }) => desc(payment.createdAt),
    where: (payment, { and, eq }) =>
      and(eq(payment.status, "pending"), eq(payment.userId, userId)),
    with: {
      creditsBatchToPayment: {
        with: {
          creditsBatch: true,
        },
      },
    },
  });

  return pendingPayments.find((payment) => {
    const linkedCreditsBatch = payment.creditsBatchToPayment?.creditsBatch;

    const isSameCreditsPackage =
      linkedCreditsBatch?.creditsPackageId === creditsPackageId;

    const isPending = linkedCreditsBatch?.status === "pending";

    return isSameCreditsPackage && isPending;
  });
}
