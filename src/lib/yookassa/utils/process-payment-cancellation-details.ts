import type { PaymentCancellationDetails } from "@/codegen/api/yookassa";

import { paymentCancellationParties } from "../constants/payment-cancellation-parties";
import { paymentCancellationReasons } from "../constants/payment-cancellation-reasons";

export function processPaymentCancellationDetails(
  paymentCancellationDetails: PaymentCancellationDetails | undefined,
): string {
  if (!paymentCancellationDetails) {
    return "Оплата была отменена по неизвестной причине";
  }

  const reason = paymentCancellationReasons[paymentCancellationDetails.reason];
  const party = paymentCancellationParties[paymentCancellationDetails.party];

  return `Сторона, отменившая оплату: ${party}.\nПричина отмены: ${reason}`;
}
