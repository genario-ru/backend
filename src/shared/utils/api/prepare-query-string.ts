import { isEmpty } from "es-toolkit/compat";
import qs from "qs";

import { removeUndefinedFields } from "@/shared/utils/api/remove-undefined-fields";

type PrepareQueryString = {
  queryParams?: object | null;
  includeQuestionmark?: boolean;
};

export function prepareQueryString(params?: PrepareQueryString) {
  const { queryParams, includeQuestionmark = false } = params ?? {};

  if (!queryParams) {
    return "";
  }

  const clenedQueryParams = removeUndefinedFields(queryParams);

  if (isEmpty(clenedQueryParams)) {
    return "";
  }

  const queryString = qs.stringify(clenedQueryParams, {
    arrayFormat: "repeat",
  });

  if (includeQuestionmark) {
    return `?${queryString}`;
  }

  return queryString;
}
