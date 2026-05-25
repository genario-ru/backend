import { postPayments } from "@/codegen/api/yookassa/clients/post-payments";

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
      receipt: {
        customer: {
          email: userEmail,
        },
        items: [
          {
            description: receiptItemDescription,
            amount: {
              value: amountValue.toString(),
              currency: "RUB",
            },
            vat_code: 1,
            quantity: 1,
            measure: "piece",
            payment_subject: "service",
            payment_mode: "full_payment",
          },
        ],
      },
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
