import type { ReceiptData } from "@/codegen/api/yookassa";

type BuildYooKassaReceiptParams = {
  userEmail: string;
  receiptItemDescription: string;
  amountValue: number;
};

// Общий билдер чека для платежей ЮKassa: и обычный, и рекуррентный платеж
// формируют один и тот же чек с единственной позицией. Возвращаемый тип явно
// привязан к ReceiptData из кодгена, чтобы строковые литералы (measure,
// payment_subject, payment_mode) сверялись с enum-типами провайдера.
export function buildYooKassaReceipt({
  userEmail,
  receiptItemDescription,
  amountValue,
}: BuildYooKassaReceiptParams): ReceiptData {
  return {
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
  };
}
