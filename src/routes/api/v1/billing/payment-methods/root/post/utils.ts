import { omit } from "es-toolkit";
import { isEmpty } from "es-toolkit/compat";

import type { PostPaymentMethodsMutationResponse } from "@/codegen/api/yookassa";
import { removeUndefinedFields } from "@/utils/api/remove-undefined-fields";

export const prepareYooKassaPaymentMethodData = (
  data: PostPaymentMethodsMutationResponse,
) => {
  const omitedData = omit(data, [
    "id",
    "type",
    "saved",
    "status",
    "title",
    "confirmation",
  ]);

  const cleanedData = removeUndefinedFields(omitedData);

  if (isEmpty(cleanedData)) {
    return undefined;
  }

  return cleanedData;
};
