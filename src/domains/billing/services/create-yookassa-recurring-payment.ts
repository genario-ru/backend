import { postPayments } from "@/codegen/api/yookassa/clients/post-payments";

import { buildYooKassaReceipt } from "../utils/build-yookassa-receipt";

type CreateYooKassaPaymentParams = {
  amountValue: number;
  description: string;
  userEmail: string;
  receiptItemDescription: string;
  paymentMethodId: string;
  idempotenceKey: string;
};

export function createYooKassaRecurringPayment({
  amountValue,
  description,
  userEmail,
  receiptItemDescription,
  paymentMethodId,
  idempotenceKey,
}: CreateYooKassaPaymentParams) {
  return postPayments({
    data: {
      payment_method_id: paymentMethodId,
      amount: {
        value: amountValue.toString(),
        currency: "RUB",
      },
      description,
      receipt: buildYooKassaReceipt({
        userEmail,
        receiptItemDescription,
        amountValue,
      }),
      capture: true,
    },
    headers: {
      "Idempotence-Key": idempotenceKey,
    },
  });
}
