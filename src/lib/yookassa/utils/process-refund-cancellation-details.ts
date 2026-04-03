import type { RefundCancellationDetails } from "@/codegen/api/yookassa";

import { refundCancellationParties } from "../constants/refund-cancellation-parties";
import { refundCancellationReasons } from "../constants/refund-cancellation-reasons";

export function processRefundCancellationDetails(
  refundCancellationDetails: RefundCancellationDetails | undefined,
): string {
  if (!refundCancellationDetails) {
    return "Возврат был отменен по неизвестной причине";
  }

  const reason = refundCancellationReasons[refundCancellationDetails.reason];
  const party = refundCancellationParties[refundCancellationDetails.party];

  return `Сторона, отменившая возврат: ${party}.\nПричина отмены: ${reason}`;
}
