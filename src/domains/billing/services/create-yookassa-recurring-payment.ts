import { postPayments } from "@/codegen/api/yookassa/clients/post-payments";

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
      capture: true,
    },
    headers: {
      "Idempotence-Key": idempotenceKey,
    },
  });
}
