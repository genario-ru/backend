import { postPaymentMethods } from "@/codegen/api/yookassa";

type CreateYooKassaPaymentMethodParams = {
  returnUrl: string;
  idempotenceKey: string;
};

// Создает в ЮKassa привязку банковской карты (payment_method) с подтверждением
// через redirect. Обертка над postPaymentMethods — аналог create-утилит для
// платежей, чтобы ручки не дублировали тело запроса инлайном.
export function createYooKassaPaymentMethod({
  returnUrl,
  idempotenceKey,
}: CreateYooKassaPaymentMethodParams) {
  return postPaymentMethods({
    headers: {
      "Idempotence-Key": idempotenceKey,
    },
    data: {
      type: "bank_card",
      confirmation: {
        type: "redirect",
        return_url: returnUrl,
      },
    },
  });
}
