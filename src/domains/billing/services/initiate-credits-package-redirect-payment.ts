import { randomUUID } from "crypto";

import type { CreditsPackage } from "@/domains/credits/schemas/entities/credits-package";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

import { prepareYooKassaCreditsPackagePaymentParams } from "../utils/prepare-yookassa-credits-package-payment-params";
import { createYooKassaPayment } from "./create-yookassa-payment";
import { getReusableCreditsPackagePendingPayment } from "./get-reusable-credits-package-pending-payment";
import { persistCreditsPackagePayment } from "./persist-credits-package-payment";

type InitiateCreditsPackageRedirectPaymentParams = {
  userId: string;
  userEmail: string;
  creditsPackage: CreditsPackage;
  creditsPackageSlug: string;
  redirectPath?: string;
};

// Инициирует оплату пакета кредитов через страницу подтверждения ЮKassa:
// создает платеж с confirmation_url, на который фронтенд редиректит
// пользователя.
export async function initiateCreditsPackageRedirectPayment({
  userId,
  userEmail,
  creditsPackage: creditsPackageToPay,
  creditsPackageSlug,
  redirectPath,
}: InitiateCreditsPackageRedirectPaymentParams) {
  const reusablePendingPayment = await getReusableCreditsPackagePendingPayment({
    userId,
    creditsPackageId: creditsPackageToPay.id,
  });

  // Переиспользуем id pending-платежа как ключ идемпотентности только если он
  // тоже был redirect-платежом: ЮKassa отклоняет повтор ключа с другим телом
  // запроса, а у рекуррентного платежа (paymentLink === null) тело другое.
  const idempotenceKey =
    reusablePendingPayment && reusablePendingPayment.paymentLink !== null
      ? reusablePendingPayment.id
      : randomUUID();

  const { amountValue, description, receiptItemDescription, returnUrl } =
    prepareYooKassaCreditsPackagePaymentParams({
      creditsPackage: creditsPackageToPay,
      userEmail,
      paymentId: idempotenceKey,
      creditsPackageSlug,
      redirectPath,
    });

  const createdYooKassaPayment = await createYooKassaPayment({
    amountValue,
    description,
    userEmail,
    receiptItemDescription,
    returnUrl,
    idempotenceKey,
  });

  if (
    !createdYooKassaPayment.confirmation ||
    !("confirmation_url" in createdYooKassaPayment.confirmation)
  ) {
    return throwAPIError({
      code: APIErrorCode.InternalServerError,
      message: "Произошла ошибка при инициализации платежа для пакета кредитов",
    });
  }

  return persistCreditsPackagePayment({
    userId,
    creditsPackage: creditsPackageToPay,
    reusablePendingPayment,
    paymentId: idempotenceKey,
    externalId: createdYooKassaPayment.id,
    amountValue,
    paymentLink: createdYooKassaPayment.confirmation.confirmation_url,
    paymentMethodId: null,
  });
}
