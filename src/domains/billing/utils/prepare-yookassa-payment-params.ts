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
  paymentId: string;
  userEmail: string;
  redirectPath?: string;
};

export function prepareYooKassaPaymentParams({
  paymentId,
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
    : `${env.FRONTEND_BASE_URL}/payment-redirect?paymentId=${paymentId}`;

  const amountValue = effectiveTariff.price;
  const description = `Оплата тарифа "${effectiveTariff.name}" для ${userEmail} | ${APP_NAME_CAPITALIZED}`;

  return {
    amountValue,
    description,
    returnUrl,
  };
}
