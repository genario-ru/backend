import { eq } from "drizzle-orm";

import { db } from "@/db";
import { creditsBatch, creditsBatchToPayment, payment } from "@/db/schema";
import type { CreditsPackage } from "@/domains/credits/schemas/entities/credits-package";

type PersistCreditsPackagePaymentParams = {
  userId: string;
  creditsPackage: CreditsPackage;
  reusablePendingPayment: { id: string } | undefined;
  paymentId: string;
  externalId: string;
  amountValue: number;
  paymentLink: string | null;
  paymentMethodId: string | null;
};

// Сохраняет платеж за пакет кредитов: обновляет переиспользуемый pending-платеж
// или создает новые payment + creditsBatch со связкой. Используется и
// redirect-, и рекуррентным флоу.
export async function persistCreditsPackagePayment({
  userId,
  creditsPackage: creditsPackageToPersist,
  reusablePendingPayment,
  paymentId,
  externalId,
  amountValue,
  paymentLink,
  paymentMethodId,
}: PersistCreditsPackagePaymentParams) {
  if (reusablePendingPayment) {
    // paymentLink и paymentMethodId проставляем безусловно (включая null):
    // pending-платеж мог быть создан другим флоу, а по paymentLink обработчики
    // вебхуков отличают рекуррентный платеж от redirect-платежа.
    const [updatedPayment] = await db
      .update(payment)
      .set({
        externalId,
        paymentLink,
        paymentMethodId,
        amount: amountValue,
        currency: "RUB",
      })
      .where(eq(payment.id, reusablePendingPayment.id))
      .returning();

    return updatedPayment;
  }

  const createdPayment = await db.transaction(async (tx) => {
    const [[createdPayment], [createdCreditsBatch]] = await Promise.all([
      tx
        .insert(payment)
        .values({
          id: paymentId,
          userId,
          amount: amountValue,
          currency: "RUB",
          externalId,
          paymentLink,
          paymentMethodId,
          status: "pending",
        })
        .returning(),
      tx
        .insert(creditsBatch)
        .values({
          userId,
          creditsPackageId: creditsPackageToPersist.id,
          name: creditsPackageToPersist.name,
          description: creditsPackageToPersist.description,
          remainingAmount: creditsPackageToPersist.amount,
          status: "pending",
        })
        .returning(),
    ]);

    await tx.insert(creditsBatchToPayment).values({
      creditsBatchId: createdCreditsBatch.id,
      paymentId: createdPayment.id,
    });

    return createdPayment;
  });

  return createdPayment;
}
