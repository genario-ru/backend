import type { CreditsPackage } from "@/domains/credits/schemas/entities/credits-package";
import { env } from "@/env";

type PrepareYooKassaCreditsPackagePaymentParams = {
  creditsPackage: CreditsPackage;
  userEmail: string;
  paymentId: string;
  redirectPath?: string;
};

// Готовит параметры платежа ЮKassa для пакета кредитов. Зеркалит
// prepareYooKassaPaymentParams (тарифы), но с описаниями для пакета кредитов.
export function prepareYooKassaCreditsPackagePaymentParams({
  creditsPackage,
  userEmail,
  paymentId,
  redirectPath,
}: PrepareYooKassaCreditsPackagePaymentParams) {
  const returnUrl = redirectPath
    ? `${env.FRONTEND_BASE_URL}${redirectPath}`
    : `${env.FRONTEND_BASE_URL}/payment-redirect?paymentId=${paymentId}`;

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
