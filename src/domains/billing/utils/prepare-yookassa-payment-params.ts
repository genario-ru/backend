import type { Tariff } from "@/domains/tariffs/schemas/entities/tariff";
import { env } from "@/env";
import { APP_NAME_CAPITALIZED } from "@/shared/constants/common/app-info";

type PrepareYooKassaPaymentWithFallbackTariffParams = {
  tariff?: Tariff;
  fallbackTariff: Tariff;
};

type PrepareYooKassaPaymentWithoutFallbackTariffParams = {
  tariff: Tariff;
};

type PrepareYooKassaPaymentTariffParams =
  | PrepareYooKassaPaymentWithFallbackTariffParams
  | PrepareYooKassaPaymentWithoutFallbackTariffParams;

type PrepareYooKassaPaymentParams = PrepareYooKassaPaymentTariffParams & {
  userEmail: string;
  redirectPath?: string;
};

export function prepareYooKassaPaymentParams({
  userEmail,
  redirectPath,
  ...params
}: PrepareYooKassaPaymentParams) {
  const effectiveTariff =
    "fallbackTariff" in params
      ? (params.tariff ?? params.fallbackTariff)
      : params.tariff;

  const returnUrl = redirectPath
    ? `${env.FRONTEND_BASE_URL}${redirectPath}`
    : `${env.FRONTEND_BASE_URL}/home`;

  const amountValue = effectiveTariff.price;
  const description = `Оплата тарифа "${effectiveTariff.name}" для ${userEmail} | ${APP_NAME_CAPITALIZED}`;

  return {
    amountValue,
    description,
    returnUrl,
  };
}
