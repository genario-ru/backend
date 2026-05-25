import type { Tariff } from "@/domains/tariffs/schemas/entities/tariff";
import { APP_NAME_CAPITALIZED } from "@/shared/constants/common/app-info";

type PrepareYooKassaRecurringPaymentParams = {
  tariff: Tariff;
  userEmail: string;
};

export function prepareYooKassaRecurringPaymentParams({
  tariff,
  userEmail,
}: PrepareYooKassaRecurringPaymentParams) {
  const amountValue = tariff.price;
  const description = `Оплата тарифа "${tariff.name}" для ${userEmail} | ${APP_NAME_CAPITALIZED}`;

  return {
    amountValue,
    description,
  };
}
