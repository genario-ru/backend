import type { PaymentCancellationDetailsPartyEnumKey } from "@/codegen/api/yookassa";

export const paymentCancellationParties: Record<
  PaymentCancellationDetailsPartyEnumKey,
  string
> = {
  merchant: "Продавец товаров и услуг (вы)",
  yoo_money: "ЮKassa",
  payment_network:
    "Любые участники процесса платежа, кроме ЮKassa и вас (например, эмитент, сторонний платежный сервис)",
} as const;
