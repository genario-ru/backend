import { randomUUID } from "crypto";

import type { CreditsPackage } from "@/domains/credits/schemas/entities/credits-package";

import type { PaymentMethod } from "../schemas/entities/payment-method";
import { prepareYooKassaCreditsPackageRecurringPaymentParams } from "../utils/prepare-yookassa-credits-package-recurring-payment-params";
import { createYooKassaRecurringPayment } from "./create-yookassa-recurring-payment";
import { getReusableCreditsPackagePendingPayment } from "./get-reusable-credits-package-pending-payment";
import { persistCreditsPackagePayment } from "./persist-credits-package-payment";

type InitiateCreditsPackageRecurringPaymentParams = {
  userId: string;
  userEmail: string;
  creditsPackage: CreditsPackage;
  paymentMethod: Pick<PaymentMethod, "id" | "externalId">;
};

// Инициирует оплату пакета кредитов рекуррентным платежом ЮKassa: деньги
// списываются с сохраненного способа оплаты без редиректа на страницу
// подтверждения. Способ оплаты должен быть заранее провалидирован (активен и
// принадлежит пользователю).
export async function initiateCreditsPackageRecurringPayment({
  userId,
  userEmail,
  creditsPackage: creditsPackageToPay,
  paymentMethod: paymentMethodToCharge,
}: InitiateCreditsPackageRecurringPaymentParams) {
  const reusablePendingPayment = await getReusableCreditsPackagePendingPayment({
    userId,
    creditsPackageId: creditsPackageToPay.id,
  });

  // Переиспользуем id pending-платежа как ключ идемпотентности только если он
  // тоже был рекуррентным: ЮKassa отклоняет повтор ключа с другим телом
  // запроса, а у redirect-платежа (paymentLink !== null) тело другое.
  const idempotenceKey =
    reusablePendingPayment && reusablePendingPayment.paymentLink === null
      ? reusablePendingPayment.id
      : randomUUID();

  const { amountValue, description, receiptItemDescription } =
    prepareYooKassaCreditsPackageRecurringPaymentParams({
      creditsPackage: creditsPackageToPay,
      userEmail,
    });

  const createdYooKassaRecurringPayment = await createYooKassaRecurringPayment({
    amountValue,
    description,
    userEmail,
    receiptItemDescription,
    paymentMethodId: paymentMethodToCharge.externalId,
    idempotenceKey,
  });

  return persistCreditsPackagePayment({
    userId,
    creditsPackage: creditsPackageToPay,
    reusablePendingPayment,
    paymentId: idempotenceKey,
    externalId: createdYooKassaRecurringPayment.id,
    amountValue,
    paymentLink: null,
    paymentMethodId: paymentMethodToCharge.id,
  });
}
