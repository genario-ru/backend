import type { CreditsPackage } from "@/domains/credits/schemas/entities/credits-package";
import { env } from "@/env";
import { prepareQueryString } from "@/shared/utils/api/prepare-query-string";

type PrepareYooKassaCreditsPackagePaymentParams = {
  creditsPackage: CreditsPackage;
  userEmail: string;
  paymentId: string;
  creditsPackageSlug: string;
  redirectPath?: string;
};

// Готовит параметры платежа ЮKassa для пакета кредитов. Зеркалит
// prepareYooKassaPaymentParams (тарифы), но с описаниями для пакета кредитов.
export function prepareYooKassaCreditsPackagePaymentParams({
  creditsPackage,
  userEmail,
  paymentId,
  creditsPackageSlug,
  redirectPath,
}: PrepareYooKassaCreditsPackagePaymentParams) {
  const defaultRedirectQueryString = prepareQueryString({
    queryParams: {
      paymentId,
      creditsPackageSlug,
    },
  });

  const returnUrl = redirectPath
    ? `${env.FRONTEND_BASE_URL}${redirectPath}`
    : `${env.FRONTEND_BASE_URL}/payment-redirect?${defaultRedirectQueryString}`;

  const amountValue = creditsPackage.price;
  const description = `Оплата пакета кредитов "${creditsPackage.name}" для ${userEmail}`;
  const receiptItemDescription = `Пакет кредитов "${creditsPackage.name}" в сервисе ${env.FRONTEND_BASE_URL}`;

  return {
    amountValue,
    description,
    receiptItemDescription,
    returnUrl,
  };
}
