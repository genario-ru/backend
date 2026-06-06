import { db } from "@/db";

type GetReusableSubscriptionPendingPaymentParams = {
  userId: string;
  subscriptionId: string;
};

// Возвращает последний рекуррентный pending-платеж, связанный с подпиской.
// Его id мы переиспользуем как ключ идемпотентности при повторной инициации
// списания: ЮKassa по тому же ключу вернет тот же платеж, а не спишет деньги
// второй раз. Это защищает от двойного списания, когда крон запускается снова,
// а вебхук по предыдущей попытке еще не пришел.
//
// Платежи со ссылкой на оплату (paymentLink) сюда не попадают: это первичные
// checkout-платежи с подтверждением через redirect, и их ключ нельзя
// переиспользовать для рекуррентного запроса (другое тело запроса в ЮKassa).
export async function getReusableSubscriptionPendingPayment({
  userId,
  subscriptionId,
}: GetReusableSubscriptionPendingPaymentParams) {
  const pendingPayments = await db.query.payment.findMany({
    orderBy: (payment, { desc }) => desc(payment.createdAt),
    where: (payment, { and, eq, isNull }) =>
      and(
        eq(payment.status, "pending"),
        eq(payment.userId, userId),
        isNull(payment.paymentLink),
      ),
    with: {
      subscriptionToPayment: true,
    },
  });

  return pendingPayments.find(
    (payment) =>
      payment.subscriptionToPayment?.subscriptionId === subscriptionId,
  );
}
