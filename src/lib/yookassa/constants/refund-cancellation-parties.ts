import type { RefundCancellationDetailsPartyEnumKey } from "@/codegen/api/yookassa";

export const refundCancellationParties: Record<
  RefundCancellationDetailsPartyEnumKey,
  string
> = {
  yoo_money: "ЮKassa",
  refund_network:
    "Любые участники процесса возврата, кроме ЮKassa и вас (например, эмитент банковской карты)",
} as const;
