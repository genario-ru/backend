import { postPayments } from "@/codegen/api/yookassa/clients/post-payments";

import { buildYooKassaReceipt } from "../utils/build-yookassa-receipt";

type CreateYooKassaPaymentParams = {
  amountValue: number;
  description: string;
  userEmail: string;
  receiptItemDescription: string;
  returnUrl: string;
  idempotenceKey: string;
};

export function createYooKassaPayment({
  amountValue,
  description,
  userEmail,
  receiptItemDescription,
  returnUrl,
  idempotenceKey,
}: CreateYooKassaPaymentParams) {
  return postPayments({
    data: {
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
      confirmation: {
        type: "redirect",
        return_url: returnUrl,
      },
      save_payment_method: true,
      capture: true,
    },
    headers: {
      "Idempotence-Key": idempotenceKey,
    },
  });
}
