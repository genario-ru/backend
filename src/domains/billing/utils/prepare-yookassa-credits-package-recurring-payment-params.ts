import type { CreditsPackage } from "@/domains/credits/schemas/entities/credits-package";
import { env } from "@/env";

type PrepareYooKassaCreditsPackageRecurringPaymentParams = {
  creditsPackage: CreditsPackage;
  userEmail: string;
};

// Готовит параметры рекуррентного платежа ЮKassa для пакета кредитов. Зеркалит
// prepareYooKassaCreditsPackagePaymentParams, но без returnUrl: списание с
// сохраненного способа оплаты проходит без редиректа на страницу подтверждения.
export function prepareYooKassaCreditsPackageRecurringPaymentParams({
  creditsPackage,
  userEmail,
}: PrepareYooKassaCreditsPackageRecurringPaymentParams) {
  const amountValue = creditsPackage.price;
  const description = `Оплата пакета кредитов "${creditsPackage.name}" для ${userEmail}`;
  const receiptItemDescription = `Пакет кредитов "${creditsPackage.name}" в сервисе ${env.FRONTEND_BASE_URL}`;

  return {
    amountValue,
    description,
    receiptItemDescription,
  };
}
