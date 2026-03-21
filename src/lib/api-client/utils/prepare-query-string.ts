import { isEmpty } from "es-toolkit/compat";
import qs from "qs";

type PrepareQueryString = {
  queryParams?: object | null;
  includeQuestionmark?: boolean;
};

export function prepareQueryString(params?: PrepareQueryString) {
  const { queryParams, includeQuestionmark = false } = params ?? {};

  if (isEmpty(queryParams)) {
    return "";
  }

  const queryString = qs.stringify(queryParams, {
    arrayFormat: "repeat",
  });

  if (includeQuestionmark) {
    return `?${queryString}`;
  }

  return queryString;
}
